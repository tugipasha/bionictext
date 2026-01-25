/**
 * BionicText - Reading Race Logic (Online & Local)
 */

const raceState = {
    isActive: false,
    mode: 'local', // 'local' or 'online'
    onlineRoomId: null,
    myPlayerNum: null, // 1 or 2
    startTime: null,
    wordCount: 0,
    player1: { name: '', finished: false, endTime: null, wpm: 0 },
    player2: { name: '', finished: false, endTime: null, wpm: 0 },
    timerInterval: null
};

// --- Mode Switching ---
window.switchRaceMode = function(mode) {
    raceState.mode = mode;
    const localSetup = document.getElementById('localSetup');
    const onlineSetup = document.getElementById('onlineSetup');
    const localBtn = document.getElementById('localModeBtn');
    const onlineBtn = document.getElementById('onlineModeBtn');
    const raceSettings = document.getElementById('raceSettings');

    if (mode === 'online') {
        localSetup.classList.add('hidden');
        onlineSetup.classList.remove('hidden');
        raceSettings.classList.add('hidden');
        onlineBtn.classList.add('bg-white', 'shadow-sm', 'text-primary');
        onlineBtn.classList.remove('text-gray-500');
        localBtn.classList.remove('bg-white', 'shadow-sm', 'text-primary');
        localBtn.classList.add('text-gray-500');
    } else {
        localSetup.classList.remove('hidden');
        onlineSetup.classList.add('hidden');
        raceSettings.classList.remove('hidden');
        localBtn.classList.add('bg-white', 'shadow-sm', 'text-primary');
        localBtn.classList.remove('text-gray-500');
        onlineBtn.classList.remove('bg-white', 'shadow-sm', 'text-primary');
        onlineBtn.classList.add('text-gray-500');
    }
};

// --- Online Matchmaking ---
window.findMatch = async function() {
    const user = window.firebaseAuth.currentUser;
    const playerName = user ? (user.displayName || user.email.split('@')[0]) : 'Player_' + Math.floor(Math.random() * 1000);
    
    document.getElementById('matchmakingSpinner').classList.remove('hidden');
    document.getElementById('findMatchBtn').classList.add('hidden');
    document.getElementById('cancelMatchBtn').classList.remove('hidden');
    document.getElementById('matchmakingText').textContent = "Rakip aranıyor...";

    try {
        const db = window.firebaseDb;
        const roomsRef = window.firebaseCollection(db, 'race_rooms');
        
        // 1. Check for available rooms (waiting for player 2)
        const q = window.firebaseQuery(
            roomsRef, 
            window.firebaseWhere('status', '==', 'waiting'),
            window.firebaseLimit(1)
        );
        
        const querySnapshot = await window.firebaseGetDocs(q);
        
        if (!querySnapshot.empty) {
            // Join existing room
            const roomDoc = querySnapshot.docs[0];
            raceState.onlineRoomId = roomDoc.id;
            raceState.myPlayerNum = 2;
            
            await window.firebaseUpdateDoc(window.firebaseDoc(db, 'race_rooms', roomDoc.id), {
                player2Name: playerName,
                status: 'starting',
                updatedAt: Date.now()
            });
            
            initOnlineRace(roomDoc.id);
        } else {
            // Create new room
            const newRoomRef = await window.firebaseAddDoc(roomsRef, {
                player1Name: playerName,
                player2Name: null,
                status: 'waiting',
                textKey: document.getElementById('raceTextSelect').value,
                mode: 'bionic', // Default to bionic for online
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            
            raceState.onlineRoomId = newRoomRef.id;
            raceState.myPlayerNum = 1;
            
            initOnlineRace(newRoomRef.id);
        }
    } catch (error) {
        console.error("Matchmaking error:", error);
        window.showNotification("Eşleşme sırasında bir hata oluştu.", "error");
        cancelMatchmaking();
    }
};

window.cancelMatchmaking = async function() {
    if (raceState.onlineRoomId && raceState.myPlayerNum === 1) {
        try {
            await window.firebaseDeleteDoc(window.firebaseDoc(window.firebaseDb, 'race_rooms', raceState.onlineRoomId));
        } catch (e) { console.error(e); }
    }
    
    raceState.onlineRoomId = null;
    document.getElementById('matchmakingSpinner').classList.add('hidden');
    document.getElementById('findMatchBtn').classList.remove('hidden');
    document.getElementById('cancelMatchBtn').classList.add('hidden');
    document.getElementById('matchmakingText').textContent = "Diğer oyuncularla eşleşmek için butona basın";
};

function initOnlineRace(roomId) {
    const db = window.firebaseDb;
    const roomRef = window.firebaseDoc(db, 'race_rooms', roomId);
    
    // Listen for room changes
    const unsubscribe = window.firebaseOnSnapshot(roomRef, (doc) => {
        if (!doc.exists()) {
            unsubscribe();
            return;
        }
        
        const data = doc.data();
        
        if (data.status === 'starting' && raceState.myPlayerNum === 1) {
            // Player 1 triggers the start for both
            window.showNotification("Rakip bulundu! Yarış başlıyor...", "success");
            setTimeout(() => {
                window.firebaseUpdateDoc(roomRef, { status: 'active', startTime: Date.now() + 3000 });
            }, 2000);
        }
        
        if (data.status === 'active' && !raceState.isActive) {
            startOnlineRaceSession(data);
        }

        // Update opponent progress/finish status
        if (raceState.isActive) {
            const oppNum = raceState.myPlayerNum === 1 ? 2 : 1;
            const oppFinished = data[`player${oppNum}Finished`];
            if (oppFinished && !raceState[`player${oppNum}`].finished) {
                raceState[`player${oppNum}`].finished = true;
                raceState[`player${oppNum}`].wpm = data[`player${oppNum}WPM`];
                document.getElementById(`p${oppNum}Timer`).textContent = "BİTTİ";
                window.showNotification("Rakip okumayı bitirdi!", "info");
                checkRaceEnd();
            }
        }
    });
    
    raceState.unsubscribeRoom = unsubscribe;
}

async function startOnlineRaceSession(roomData) {
    raceState.isActive = true;
    document.getElementById('raceSetup').classList.add('hidden');
    document.getElementById('raceActive').classList.remove('hidden');
    
    const textKey = roomData.textKey;
    const lang = window.currentLanguage || 'tr';
    const textObj = window.presetTexts[lang][textKey] || window.presetTexts['en'][textKey];
    const baseText = typeof textObj === 'string' ? textObj : textObj.normal;
    
    raceState.wordCount = baseText.split(/\s+/).length;
    raceState.player1.name = roomData.player1Name;
    raceState.player2.name = roomData.player2Name || "Rakip";
    
    document.getElementById('p1Display').textContent = raceState.player1.name;
    document.getElementById('p2Display').textContent = raceState.player2.name;
    
    const displayP1 = window.convertToBionic ? window.convertToBionic(baseText) : baseText;
    const displayP2 = window.convertToBionic ? window.convertToBionic(baseText) : baseText;
    
    document.getElementById('p1Text').innerHTML = displayP1;
    document.getElementById('p2Text').innerHTML = displayP2;

    // Start countdown
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        if (countdown > 0) {
            window.showNotification(countdown + "...", "info");
            countdown--;
        } else {
            clearInterval(countdownInterval);
            window.showNotification("BAŞLA!", "success");
            raceState.startTime = Date.now();
            startTimer();
        }
    }, 1000);
}

// --- Local Race Logic ---
window.startRace = function(mode) {
    const p1Name = document.getElementById('player1Name').value || 'Player 1';
    const p2Name = document.getElementById('player2Name').value || 'Player 2';
    const textKey = document.getElementById('raceTextSelect').value;
    
    let textObj = null;
    const lang = window.currentLanguage || 'tr';
    const texts = window.presetTexts || {};
    
    if (texts[lang] && texts[lang][textKey]) {
        textObj = texts[lang][textKey];
    } else if (texts['en'] && texts['en'][textKey]) {
        textObj = texts['en'][textKey];
    }

    if (!textObj) return;

    const baseText = typeof textObj === 'string' ? textObj : textObj.normal;
    
    raceState.isActive = true;
    raceState.mode = 'local';
    raceState.player1 = { name: p1Name, finished: false, endTime: null, wpm: 0 };
    raceState.player2 = { name: p2Name, finished: false, endTime: null, wpm: 0 };
    raceState.wordCount = baseText.split(/\s+/).length;
    raceState.startTime = Date.now();

    document.getElementById('raceSetup').classList.add('hidden');
    document.getElementById('raceActive').classList.remove('hidden');
    document.getElementById('p1Display').textContent = p1Name;
    document.getElementById('p2Display').textContent = p2Name;
    
    const displayP1 = mode === 'bionic' && window.convertToBionic ? window.convertToBionic(baseText) : baseText;
    const displayP2 = mode === 'bionic' && window.convertToBionic ? window.convertToBionic(baseText) : baseText;
    
    document.getElementById('p1Text').innerHTML = displayP1;
    document.getElementById('p2Text').innerHTML = displayP2;

    startTimer();
};

// --- Shared Logic ---
function startTimer() {
    if (raceState.timerInterval) clearInterval(raceState.timerInterval);
    
    raceState.timerInterval = setInterval(() => {
        if (!raceState.isActive) return;
        
        const elapsed = Date.now() - raceState.startTime;
        const timeStr = formatTime(elapsed);
        
        if (!raceState.player1.finished) document.getElementById('p1Timer').textContent = timeStr;
        if (!raceState.player2.finished) document.getElementById('p2Timer').textContent = timeStr;
    }, 100);
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

window.finishPlayer = async function(playerNum) {
    if (!raceState.isActive) return;
    
    const player = playerNum === 1 ? raceState.player1 : raceState.player2;
    if (player.finished) return;

    // In online mode, you can only finish yourself
    if (raceState.mode === 'online' && playerNum !== raceState.myPlayerNum) return;

    player.finished = true;
    player.endTime = Date.now();
    
    const elapsedMinutes = (player.endTime - raceState.startTime) / 60000;
    player.wpm = Math.round(raceState.wordCount / elapsedMinutes);
    
    document.getElementById(`p${playerNum}Timer`).textContent = "BİTTİ";
    document.getElementById(`p${playerNum}FinishBtn`).disabled = true;

    if (raceState.mode === 'online') {
        const updateData = {};
        updateData[`player${playerNum}Finished`] = true;
        updateData[`player${playerNum}WPM`] = player.wpm;
        await window.firebaseUpdateDoc(window.firebaseDoc(window.firebaseDb, 'race_rooms', raceState.onlineRoomId), updateData);
    }

    checkRaceEnd();
};

function checkRaceEnd() {
    if (raceState.player1.finished && raceState.player2.finished) {
        raceState.isActive = false;
        clearInterval(raceState.timerInterval);
        showResults();
    }
}

function showResults() {
    document.getElementById('raceActive').classList.add('hidden');
    document.getElementById('raceResults').classList.remove('hidden');
    
    const p1 = raceState.player1;
    const p2 = raceState.player2;
    
    document.getElementById('resP1Name').textContent = p1.name;
    document.getElementById('resP1WPM').textContent = p1.wpm + " WPM";
    document.getElementById('resP2Name').textContent = p2.name;
    document.getElementById('resP2WPM').textContent = p2.wpm + " WPM";
    
    let winnerText = "";
    if (p1.wpm > p2.wpm) {
        winnerText = p1.name + " Kazandı! 🏆";
    } else if (p2.wpm > p1.wpm) {
        winnerText = p2.name + " Kazandı! 🏆";
    } else {
        winnerText = "Berabere! 🤝";
    }
    document.getElementById('winnerDisplay').textContent = winnerText;

    // Cleanup online room
    if (raceState.mode === 'online' && raceState.myPlayerNum === 1) {
        // Delay cleanup so player 2 can also see the final state
        setTimeout(async () => {
            if (raceState.onlineRoomId) {
                await window.firebaseDeleteDoc(window.firebaseDoc(window.firebaseDb, 'race_rooms', raceState.onlineRoomId));
            }
        }, 5000);
    }
}

window.resetRace = function() {
    if (raceState.unsubscribeRoom) {
        raceState.unsubscribeRoom();
        raceState.unsubscribeRoom = null;
    }
    
    raceState.isActive = false;
    raceState.onlineRoomId = null;
    raceState.player1.finished = false;
    raceState.player2.finished = false;
    
    document.getElementById('raceResults').classList.add('hidden');
    document.getElementById('raceSetup').classList.remove('hidden');
    document.getElementById('p1FinishBtn').disabled = false;
    document.getElementById('p2FinishBtn').disabled = false;
    
    // Reset online UI
    document.getElementById('matchmakingSpinner').classList.add('hidden');
    document.getElementById('findMatchBtn').classList.remove('hidden');
    document.getElementById('cancelMatchBtn').classList.add('hidden');
    document.getElementById('matchmakingText').textContent = "Diğer oyuncularla eşleşmek için butona basın";
};

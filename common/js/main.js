$(document).ready(function() {
    "use strict";

    var timer;
    var seconds = 0;
    var $gameList = $('.game_main');
    var cols = 4;
    var gameStarted = false;
    var moveCount = 0;
    renderHistory();

    function updateTime() {
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        mins = mins < 10 ? "0" + mins : mins;
        secs = secs < 10 ? "0" + secs : secs;
        $('.time_zone .time').text(mins + ":" + secs);
    }

    function shuffleGame(times) {
        var $items = $gameList.children('li');
        for (var i = 0; i < times; i++) {
            var arr = $items.toArray();
            for (var j = arr.length - 1; j > 0; j--) {
                var k = Math.floor(Math.random() * (j + 1));
                var temp = arr[j];
                arr[j] = arr[k];
                arr[k] = temp;
            }
            $gameList.empty().append(arr);
        }
    }

    function swap($li1, $li2) {
        var $temp = $('<span>').hide();
        $li1.before($temp);
        $li2.before($li1);
        $temp.replaceWith($li2);
    }

    function moveEmpty(direction) {
        var $items = $gameList.children('li');
        var emptyIndex = $items.index($('.main_move'));
        var targetIndex;

        switch (direction) {
            case 'up':
                if (emptyIndex - cols >= 0) targetIndex = emptyIndex - cols;
                break;
            case 'down':
                if (emptyIndex + cols < $items.length) targetIndex = emptyIndex + cols;
                break;
            case 'left':
                if (emptyIndex % cols !== 0) targetIndex = emptyIndex - 1;
                break;
            case 'right':
                if (emptyIndex % cols !== cols - 1) targetIndex = emptyIndex + 1;
                break;
        }

        if (targetIndex !== undefined) {
            swap($($items[emptyIndex]), $($items[targetIndex]));
            moveCount++;
            checkWin();
        }
    }

    function checkWin() {
        var $items = $gameList.children('li');
        var win = true;
        $items.each(function(index, el) {
            var val = $(el).text().trim();
            if (index === $items.length - 1) {
                if (!$(el).hasClass('main_move')) win = false;
            } else {
                if (parseInt(val) !== index + 1) win = false;
            }
        });

        if (win) {
            saveHistory();
            clearInterval(timer);
            $('.you-win').addClass('active');
            resetGame();
        }
    }

    function saveHistory() {
        var history = JSON.parse(sessionStorage.getItem('puzzleHistory')) || [];

        history.push({
            moveCount: moveCount,
            time: $('.time_zone .time').text()
        });

        sessionStorage.setItem('puzzleHistory', JSON.stringify(history));

        renderHistory();
    }


    function renderHistory() {
        var history = JSON.parse(sessionStorage.getItem('puzzleHistory')) || [];
        var $tbody = $('.history_table tbody');
        $tbody.empty();

        if (history.length === 0) {
            $tbody.append('<tr><td colspan="3" class="text-center py-2">Chưa có dữ liệu</td></tr>');
            return;
        }

        history.forEach(function(item, index) {
            var tr = `
            <tr>
                <td class="border border-gray-200 px-4 py-2">${index + 1}</td>
                <td class="border border-gray-200 px-4 py-2">${item.moveCount}</td>
                <td class="border border-gray-200 px-4 py-2">${item.time}</td>
            </tr>
        `;
            $tbody.append(tr);
        });
    }

    function resetGame() {
        clearInterval(timer);
        seconds = 0;
        updateTime();
        moveCount = 0;
        shuffleGame(100);
        $('.start_btn').removeClass('finish_btn').text('Chơi lại').addClass('bg-green-500').removeClass('bg-red-500');
        gameStarted = false;
    }


    $('.start_btn').on('click', function() {
        clearInterval(timer);
        seconds = 0;
        moveCount = 0;
        updateTime();
        if ($('.start_btn').hasClass('finish_btn')) {
            $(this).removeClass('finish_btn');
            $(this).text('Bắt đầu');
            $(this).addClass('bg-green-500');
            $(this).removeClass('bg-red-500');
            $('.time_zone .time').text("00:00");
            gameStarted = false;

        } else {
            gameStarted = true;
            $(this).addClass('finish_btn');
            $('.game_main').addClass('start_game');
            $(this).addClass('bg-red-500');
            $(this).removeClass('bg-green-500');
            $(this).text('Kết thúc');
            timer = setInterval(function() {
                seconds++;
                updateTime();
            }, 1000);
            shuffleGame(100);
        }
    });
    $(document).on('keydown', function(e) {
        if (!gameStarted) return;
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
            e.preventDefault();
        }
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                moveEmpty('up');
                break;

            case 'KeyS':
            case 'ArrowDown':
                moveEmpty('down');
                break;

            case 'KeyA':
            case 'ArrowLeft':
                moveEmpty('left');
                break;

            case 'KeyD':
            case 'ArrowRight':
                moveEmpty('right');
                break;
        }
    });

    $('.btn_up').on('click', function() {
        if (!gameStarted) return;
        moveEmpty('up');
    });

    $('.btn_down').on('click', function() {
        if (!gameStarted) return;
        moveEmpty('down');
    });

    $('.btn_left').on('click', function() {
        if (!gameStarted) return;
        moveEmpty('left');
    });

    $('.btn_right').on('click', function() {
        if (!gameStarted) return;
        moveEmpty('right');
    });

    // === Swipe control (mobile) - replacement ===
    (function() {
        var startX = 0,
            startY = 0;
        var minDistance = 30; // ngưỡng px để coi là vuốt

        var gameEl = document.querySelector('.game_main');
        if (!gameEl) return;

        // Helper: add native event with passive: false so we can call preventDefault
        function addTouchListener(el, type, handler) {
            try {
                el.addEventListener(type, handler, { passive: false });
            } catch (e) {
                // fallback cho trình duyệt cổ
                el.addEventListener(type, handler, false);
            }
        }

        addTouchListener(gameEl, 'touchstart', function(e) {
            if (!gameStarted) return;
            var t = e.changedTouches[0];
            startX = t.clientX;
            startY = t.clientY;

            // chặn trang cuộn trong khi chơi
            e.preventDefault();
            document.body.classList.add('no-scroll');
        });

        addTouchListener(gameEl, 'touchmove', function(e) {
            if (!gameStarted) return;
            // chặn trang cuộn khi đang xử lý
            e.preventDefault();
        });

        addTouchListener(gameEl, 'touchend', function(e) {
            if (!gameStarted) return;
            document.body.classList.remove('no-scroll');

            var t = e.changedTouches[0];
            var dx = t.clientX - startX;
            var dy = t.clientY - startY;

            // Nếu người dùng chỉ chạm nhẹ (tap) thì bỏ qua
            if (Math.abs(dx) < minDistance && Math.abs(dy) < minDistance) {
                return;
            }

            // xác định hướng vuốt
            if (Math.abs(dx) > Math.abs(dy)) {
                // ngang
                if (dx > 0) {
                    moveEmpty('right');
                } else {
                    moveEmpty('left');
                }
            } else {
                // dọc
                if (dy > 0) {
                    moveEmpty('down');
                } else {
                    moveEmpty('up');
                }
            }
        });

        // trường hợp người rời vùng (cancel)
        addTouchListener(gameEl, 'touchcancel', function(e) {
            document.body.classList.remove('no-scroll');
        });
    })();


});
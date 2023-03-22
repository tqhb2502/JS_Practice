const PLAYER_CONFIG_KEY = 'PLAYER_CONFIG';

const player = document.querySelector('.player');
const dashboard = document.querySelector('.dashboard');
const nameHeader = document.querySelector('header h2');
const cdThumb = document.querySelector('.cd-thumb');
const audio = document.querySelector('#audio');
const cd = document.querySelector('.cd');
const playButton = document.querySelector('.btn-toggle-play');
const progress = document.querySelector('#progress');
const nextButton = document.querySelector('.btn-next');
const prevButton = document.querySelector('.btn-prev');
const randomButton = document.querySelector('.btn-random');
const repeatButton = document.querySelector('.btn-repeat');
const playlist = document.querySelector('.playlist');

const app = {

    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    currentSongIndex: 0,
    config: JSON.parse(localStorage.getItem(PLAYER_CONFIG_KEY)) || {},
    shuffledArray: [],
    songs: [
        {
            name: 'Call On Me',
            artist: 'Thorne',
            path: './songs/Thorne - Call On Me [NCS Release].mp3',
            image: './imgs/call-on-me-1663761638-M2dOnLpjCf.jpg'
        },
        {
            name: 'Can\'t You Feel It',
            artist: 'Wiguez, MIDNIGHT CVLT',
            path: './songs/MIDNIGHT CVLT & Wiguez - Can\'t You Feel It [NCS Release].mp3',
            image: './imgs/cant-you-feel-it-1663671638-WIofNPTdIb.jpg'
        },
        {
            name: 'When I\'m With You',
            artist: 'Arcando',
            path: './songs/_Arcando - When I\'m With You [NCS Release].mp3',
            image: './imgs/when-im-with-you-1663318836-CDhceAjm6X.jpg'
        },
        {
            name: 'Home',
            artist: 'PLEEG',
            path: './songs/_PLEEG - Home [NCS Release].mp3',
            image: './imgs/home-1663232439-UjEzKUmS1f.jpg'
        },
        {
            name: 'Follow Me',
            artist: 'Mblue',
            path: './songs/_Mblue - Follow Me [NCS Release].mp3',
            image: './imgs/follow-me-1663146037-AoFu553vhQ.jpg'
        },
        {
            name: 'Radio',
            artist: 'Mojnz, WBN',
            path: './songs/WBN x Mojnz - Radio [NCS Release].mp3',
            image: './imgs/radio-1663063238-NzTmH9aMuX.jpg'
        },
        {
            name: 'Illusion',
            artist: 'Crunr, BEAUZ',
            path: './songs/BEAUZ - Illusion (feat. Crunr) [NCS Release].mp3',
            image: './imgs/illusion-feat-crunr-1662717639-KnMb0t9YDo.jpg'
        },
        {
            name: 'Moments (Acoustic Version)',
            artist: 'Robbie Rosen, Lost Identities',
            path: './songs/Lost Identities x Robbie Rosen - Moments (Acoustic Version) [NCS Release].mp3',
            image: './imgs/1662643054_uOhtNEr7yL_Screenshot-2022-09-08-at-14.16.41.png'
        },
        {
            name: 'Like A Stone',
            artist: 'Tollef',
            path: './songs/Tollef - Like A Stone [NCS Release].mp3',
            image: './imgs/like-a-stone-1662631238-nuEbIyvTnx.jpg'
        },
        {
            name: 'Talk That Way',
            artist: 'JOXION',
            path: './songs/JOXION - Talk That Way [NCS Release].mp3',
            image: './imgs/talk-that-way-1662544836-A6ZaUL9nNu.jpg'
        },
        {
            name: 'Tonight',
            artist: 'Facading',
            path: './songs/Facading - Tonight [NCS Release].mp3',
            image: './imgs/tonight-1662458437-iFC5ssOm8A.jpg'
        }
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_CONFIG_KEY, JSON.stringify(this.config));
    },

    loadConfig: function () {

        if (this.config.isRandom === undefined) {
            this.setConfig('isRandom', this.isRandom);
        } else {
            this.isRandom = this.config.isRandom;
        }

        if (this.config.isRepeat === undefined) {
            this.setConfig('isRepeat', this.isRepeat);
        } else {
            this.isRepeat = this.config.isRepeat;
        }

        randomButton.classList.toggle('active', this.isRandom);
        repeatButton.classList.toggle('active', this.isRepeat);

        if (this.isRandom) {
            this.shuffleSongArray();
        }
    },

    render: function () {

        var htmlCodes = this.songs.map((song, index) => {
            return `
            <div class="song song-index-${index}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.artist}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`;
        });

        playlist.innerHTML = htmlCodes.join('');
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentSongIndex];
            }
        });
    },

    handleEvents: function () {

        // thu nhỏ và làm mờ ảnh khi cuộn
        const oldCdWidth = cd.offsetWidth;
        
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = oldCdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / oldCdWidth;
        };

        // quay đĩa khi nhạc chạy
        const cdThumbAnimation = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,    // 10s
            iterations: Infinity
        });
        cdThumbAnimation.pause();

        // chạy thanh trượt khi nhạc chạy
        const updateProgress = function () {
            if (audio.duration) {
                const currentProgress = audio.currentTime / audio.duration * 100;
                const roundedCurrentProgress = Math.round(currentProgress * 10) / 10;
                progress.value = roundedCurrentProgress;
            }
        };

        // bật, dừng nhạc
        playButton.onclick = function () {
            if (app.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        audio.onplay = function () {
            player.classList.add('playing');
            audio.addEventListener('timeupdate', updateProgress);
            cdThumbAnimation.play();
            app.isPlaying = true;
        }

        audio.onpause = function () {
            player.classList.remove('playing');
            cdThumbAnimation.pause();
            app.isPlaying = false;
        }

        // sửa lỗi nhẫn giữ chuột khi tua sẽ không tua được
        progress.oninput = function () {
            audio.removeEventListener('timeupdate', updateProgress);
        };

        // tua nhạc
        progress.onchange = function (e) {
            const seekTime = e.target.value / 100 * audio.duration;
            audio.currentTime = seekTime;
            audio.addEventListener('timeupdate', updateProgress);
        };

        // chuyển về bài trước
        prevButton.onclick = function () {
            if (app.isRandom) {
                app.randomSong();
            } else {
                app.prevSong();
            }
            audio.play();
        }

        // chuyển sang bài tiếp theo
        nextButton.onclick = function () {
            if (app.isRandom) {
                app.randomSong();
            } else {
                app.nextSong();
            }
            audio.play();
        };

        // bật, tắt nút phát bài ngẫu nhiên
        randomButton.onclick = function () {

            app.isRandom = !app.isRandom;
            this.classList.toggle('active', app.isRandom);

            if (app.isRepeat && app.isRandom) {
                repeatButton.click();
            }

            if (app.isRandom) {
                app.shuffleSongArray();
            }

            app.setConfig('isRandom', app.isRandom);
            app.setConfig('isRepeat', app.isRepeat);
        };

        // bật, tắt nút phát lại bài hát
        repeatButton.onclick = function () {

            app.isRepeat = !app.isRepeat;
            this.classList.toggle('active', app.isRepeat);

            if (app.isRepeat && app.isRandom) {
                randomButton.click();
            }

            app.setConfig('isRandom', app.isRandom);
            app.setConfig('isRepeat', app.isRepeat);
        };

        // xử lý chuyển bài khi bài hát kết thúc
        audio.onended = function () {
            if (app.isRepeat) {
                // không cần làm gì
            } else if (app.isRandom) {
                app.randomSong();
            } else {
                app.nextSong();
            }
            audio.play();
        };

        // xử lý chọn bài hát
        playlist.onclick = function (e) {

            const inactiveSong = e.target.closest('.song:not(.active)');
            const optionButton = e.target.closest('.option');
            
            if (optionButton) {
                // xử lý việc nhấn vào nút option
            } else if (inactiveSong) {
                const chosenSongIndex = inactiveSong.dataset.index;
                app.chooseSong(chosenSongIndex);
                audio.play();
            }
        };
    },

    loadCurrentSong: function () {

        nameHeader.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;

        const curSongElem = document.querySelector(`.song-index-${this.currentSongIndex}`);
        curSongElem.classList.add('active');

        setTimeout(() => {
            curSongElem.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 200);
    },

    inactivateCurrentSong: function () {
        const curSongElem = document.querySelector(`.song-index-${this.currentSongIndex}`);
        curSongElem.classList.remove('active');
    },

    prevSong: function () {
        this.inactivateCurrentSong();
        this.currentSongIndex--;
        if (this.currentSongIndex < 0) {
            this.currentSongIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    nextSong: function () {
        this.inactivateCurrentSong();
        this.currentSongIndex++;
        if (this.currentSongIndex === this.songs.length) {
            this.currentSongIndex = 0;
        }
        this.loadCurrentSong();
    },

    randomSong: function () {

        this.inactivateCurrentSong();
        this.currentSongIndex = this.shuffledArray.shift();
        if (!this.shuffledArray.length) {
            this.shuffleSongArray();
        }
        this.loadCurrentSong();
    },

    chooseSong: function (index) {
        this.inactivateCurrentSong();
        this.currentSongIndex = index;
        this.loadCurrentSong();
    },

    shuffleSongArray: function () {
        
        // init shuffledArray
        for (let i = 0; i < this.songs.length; i++) {
            this.shuffledArray[i] = i;
        }

        // let's shuffle (Fisher-Yates (aka Knuth) shuffle)
        let currentIndex = this.shuffledArray.length;
        let randomIndex;

        while (currentIndex !== 0) {

            // pick a remaining element
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // swap the picked element with the current element
            let tmp = this.shuffledArray[currentIndex];
            this.shuffledArray[currentIndex] = this.shuffledArray[randomIndex];
            this.shuffledArray[randomIndex] = tmp;
        }
    },

    start: function () {
        this.loadConfig();

        this.defineProperties();

        this.render();

        this.handleEvents();

        this.loadCurrentSong();
    }
};

app.start();
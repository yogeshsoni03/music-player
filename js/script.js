let currentSong = new Audio();
let songs;
let currentFolder;

async function getSong(folder) {
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (const element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +
            `<li data-song="${song}">
                <div class="songname">
                    <img class="musiclogo invert " src="image/music.svg">
                    <div class="info">
                        <div>${decodeURIComponent(song).split("\\").pop()}</div>
                        <div>Shree</div>
                    </div>
                </div>
                <div class="playnow">
                    <span>Play now</span>
                    <img class="invert" src="image/songplay.svg">
                </div>
            </li>`;

        // Attach an event listener to each song
        const list = document.querySelector(".songlist")
            .getElementsByTagName("li");

        Array.from(list).forEach((li) => {
            li.addEventListener("click", () => {
                playMusic(li.dataset.song);
            });
        });
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = track
    if (!pause) {
        currentSong.play()
        play.src = "image/songpause.svg"
    }
    document.querySelector(".songinfo").innerHTML = (track.split("%5C").slice(-1)[0])
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("songs")) {
            let folder = (e.href.split(/\/|%5C/).slice(-2)[0]);
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg data-encore-id="icon" role="img" aria-hidden="true" class="e-10451-icon"
                                viewBox="0 2 24 24">
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606">
                                </path>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.discription}</p>
                    </div>`

        }
    }

    // Load a playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(element => {
        element.addEventListener("click", async (item) => {
            await getSong(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })

    return songs;
}

async function main() {
    await getSong("songs/ncs");
    playMusic(songs[0], true);

    displayAlbums();

    // Attach an event listener to previous, play, next button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "image/songpause.svg"
        }
        else {
            currentSong.pause()
            play.src = "image/songplay.svg"
        }
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src);
        if (index > 0) {
            currentSong.pause();
            playMusic(songs[index - 1]);
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src);
        if (index < (songs.length - 1)) {
            currentSong.pause();
            playMusic(songs[index + 1]);
        }
    })

    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let parcent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = parcent + "%";
        currentSong.currentTime = ((currentSong.duration) * parcent) / 100;
    })

    // Add an event listener to hamburgure
    document.querySelector(".hamburgerContainer").addEventListener("click", e => {
        const leftMenu = document.querySelector(".left");
        leftMenu.style.left = "0"
    });

    // Add an listener to close icon
    document.querySelector(".close").addEventListener("click", e => {
        const leftMenu = document.querySelector(".left");
        leftMenu.style.left = "-110%"
    })

    // Add an event listener to volume bar
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("image/volume.svg")) {
            e.target.src = e.target.src.replace("image/volume.svg", "image/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("image/mute.svg", "image/volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    })

}

main();
<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
    const observer= new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if(e.isIntersecting){
                e.target.classList.add("run");
            }
        })
    },{
        threshold: 0.5
    })
    const storys = document.querySelectorAll(".story-text-box, .story-img");
    storys.forEach(s => {
        observer.observe(s);
    })
});
</script>
<template>
    <div class="wrapper">
        <div class="introduction">
            <div class="introduction-text story-text-box">
                <h2 class="introduction-title">
                    <span>
                        Introduction
                    </span>
                </h2>
                <div class="story-text1">
                    <p>
                        Life doesn't always go as planned, and you—as the protagonist—transfer into Gekkoukan High
                        School, located at the center of the man-made Tatsumi Port Island only for a terrifying creature
                        to attack your dorm.

                    </p>
                    <p style="padding-top: 60px;">
                        In the midst of chaos, you awaken to your Persona—a powerful force that can be used to fight
                        back.
                    </p>
                    <p style="padding-top: 90px;">
                        A group of others who share this power recruit you into their Specialized Extracurricular
                        Excecution Squad (S.E.E.S.), and so begins your journey to uncover the mysteries behind these
                        incidents...
                    </p>
                </div>
            </div>
            <div class="introduction-img story-img"></div>
        </div>
        <div class="features">
            <div class="features-img story-img"></div>
            <div class="features-text story-text-box">
                <h2 class="features-title">
                    Features
                </h2>
                <div class="story-text2">
                    <p>
                        <span>
                            The new and improved version of Persona 3 preserves the story and characters fans know and
                            love while introducing new quality-of-life mechanics and a complete graphical overhaul.
                        </span>
                    </p>
                    <p style="padding-top: 75px;">
                        <span>
                            Experience what made this game leave such an impact, now better than ever.
                        </span>
                    </p>
                </div>
            </div>
        </div>
        <div class="gamesystem">
            <div class="gamesystem-text story-text-box">
                <h2 class="gamesystem-title">
                    Game System
                </h2>
                <div class="story-text3">
                    <p>
                        <span>
                            The Persona 3 experience becomes even more enjoyable while retaining its originality.
                        </span>
                    </p>
                    <p style="padding-top: 21px;">
                        <span>
                            A more exhilarating battle system and new graphics and gimmicks make Tartarus easier to
                            explore. Dormitory life and community have also legitimately evolved!
                        </span>
                    </p>
                </div>
            </div>
            <div class="gamesystem-img story-img"></div>
        </div>
        <div class="story-text3"></div>
    </div>
</template>
<style scoped>
.wrapper {
    width: 100%;
    max-width: 1920px;
    padding-top: 195px;
}

.introduction,
.features,
.gamesystem {
    width: 100%;
    display: flex;
    align-items: center;
}

.introduction,
.gamesystem {
    justify-content: flex-end;
}

.features {
    justify-content: flex-start;
}


.features {
    margin-top: 87px;
}

.gamesystem {
    margin-top: 162px;
}

.introduction-text {
    width: 620px;
    padding: 56px  32px 0 20px;
}

.features-text {
    width: 600px;
    padding: 31px 20px 0 0;
    margin-left: 81px;

}

.gamesystem-text {
    width: 600px;
    padding: 31px 20px 0;

}

.introduction-img,
.features-img,
.gamesystem-img {
    background: url(../../assets/img/ss_introduction.png) center top / auto 100% no-repeat;
    position: relative;
    height: 425px;
    width: calc(1000 / 1920 * 100vw);
    max-width: 1000px;
    overflow: hidden;

}

.introduction-img::before,
.features-img::before,
.gamesystem-img::before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
    transform: translateY(0);
}

.introduction-img.run::before,
.features-img.run::before,
.gamesystem-img.run::before {
    transform: translateY(-100%);
    transition: transform 0.3s linear;
}

.features-img {
    background: url(../../assets/img/ss_features.png) center top / auto 100% no-repeat;
}

.gamesystem-img {
    background: url(../../assets/img/ss_game_system.jpg) center top / auto 100% no-repeat;
}
</style>
import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SoundOnOff from '../views/SoundOnOff.vue'
import MainMenu2 from '../views/MainMenu2.vue'
import BuildTeam from '../views/BuildTeam.vue'
import TutorialList from '../views/TutorialList.vue'
import TeamBuilder from '../views/BuildTeam2.vue'
import ChooseJourney from '../views/ChooseJourney.vue'
import ChooseJourney2 from '../views/ChooseJourney2.vue'
import Credits from '../views/Credits.vue'
import IntroSequence from '../views/IntroSequence.vue'
import COHLogo from '../views/COHLogo.vue'
import GameApp from '../GameApp.vue'
import PostMatch from '../views/PostMatch.vue'
import LogoScreen from '../views/LogoScreen.vue'
import { Track } from '@/GameData/SoundLibrary'
import { getBattleTrack, playWelcomeToDieForMeSound, playChooseJourneySound, stopCurrentMusic } from '@/GameData/SoundUtils'
import { SoundManager } from '@/GameData/SoundManager'
import { AssetPreloader } from '@/GameData/AssetPreloader'

interface Route {
  path: string;
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'SoundOnOff',
    component: SoundOnOff,
  },
  {
    path: '/Intro',
    name: 'Intro',
    component: IntroSequence,
  },
  {
    path: '/COHLogo',
    name: 'COHLogo',
    component: COHLogo,
  },
  {
    path: '/LogoScreen',
    name: 'LogoScreen',
    component: LogoScreen,
  },
  {
    path: '/MainMenu',
    name: 'MainMenu',
    component: MainMenu2,
  },
  {
    path: '/TutorialList',
    name: 'TutorialList',
    component: TutorialList,
  },
  {
    path: '/Team',
    name: 'TeamBuilder',
    component: TeamBuilder,
  },
  {
    path: '/Journey',
    name: 'ChooseJourney',
    component: ChooseJourney2,
  },
  {
    path: '/Credits',
    name: 'Credits',
    component: Credits,
  },
  {
    path: '/Match',
    name: 'Match',
    component: GameApp,
  },
  {
    path: '/PostMatch',
    name: 'PostMatch',
    component: PostMatch
  }


]

const router = createRouter({
  history: createWebHistory(),
  routes
})


const routeToTrack = [
  {path: '/MainMenu', track: Track.MAIN_MENU},
  {path: '/TutorialList', track: Track.MAIN_MENU},
  {path: '/Team', track: Track.BUILD_TEAM},
  {path: '/Journey', track: Track.JOURNEY},
  {path: '/Match', track: getBattleTrack},
  // {path: '/PostMatch', track: getPostBattleTrack},
]

const routeToPreloader = [
  {path: '/', preloader: () => AssetPreloader.getInstance().preloadLogoScreen()},
  {path: '/LogoScreen', preloader: () => AssetPreloader.getInstance().preloadMainMenu()},
  {path: '/MainMenu', preloader: () => AssetPreloader.getInstance().preloadBuildTeam()},
  {path: '/Team', preloader: () => AssetPreloader.getInstance().preloadJourney()},
  {path: '/Journey', preloader: () => AssetPreloader.getInstance().preloadMatch()},
  {path: '/TutorialList', preloader: () => AssetPreloader.getInstance().preloadMatch()},
  {path: '/Match', preloader: () => AssetPreloader.getInstance().preloadPostMatch()},
]

router.beforeEach((to, from, next) => {
  preloadAssets(to,from);
  handleMusicChange(to, from);
  next();
});

function preloadAssets(to: Route, from: Route) {
   const routePreloader = routeToPreloader.find(route => route.path === to.path);
   if(typeof routePreloader !== 'undefined') {
    routePreloader.preloader();
   }
}

function handleMusicChange(to: Route, from: Route) {
  if(from.path === '/Intro' || from.path === '/' && to.path === '/MainMenu') {
    playWelcomeToDieForMeSound();
  }
  
  if(from.path === '/Team' && to.path === '/Journey') {
    playChooseJourneySound();
  }
  
  const nextScreenTrack = routeToTrack.find(route => route.path === to.path);
  if(!nextScreenTrack) {
    stopCurrentMusic();
    return;
  }

  const prevScreenTrack = routeToTrack.find(route => route.path === from.path);
  if(!prevScreenTrack) {
    const trackResource = nextScreenTrack.track;
    const trackToPlay = typeof trackResource === 'function' ? trackResource() : trackResource;
    SoundManager.getInstance().playMusic(trackToPlay);
    return;
  }

  if(prevScreenTrack.track === nextScreenTrack.track) {
    return;
  }

  stopCurrentMusic();
  const trackResource = nextScreenTrack.track;
  const trackToPlay = typeof trackResource === 'function' ? trackResource() : trackResource;
  SoundManager.getInstance().playMusic(trackToPlay);
}

export default router


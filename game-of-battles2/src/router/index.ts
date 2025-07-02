import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SoundOnOff from '../views/SoundOnOff.vue'
import MainMenu from '../views/MainMenu.vue'
import MainMenu2 from '../views/MainMenu2.vue'
import BuildTeam from '../views/BuildTeam.vue'
import TeamBuilder from '../views/BuildTeam2.vue'
import ChooseJourney from '../views/ChooseJourney.vue'
import ChooseJourney2 from '../views/ChooseJourney2.vue'
import Credits from '../views/Credits.vue'
import Movie from '../views/Movie.vue'
import IntroSequence from '../views/IntroSequence.vue'
import GameApp from '../GameApp.vue'

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
    path: '/Movie',
    name: 'Movie',
    component: Movie,
  },
  {
    path: '/MainMenu',
    name: 'MainMenu',
    component: MainMenu2,
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
  }


]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

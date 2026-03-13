import { defineStore } from 'pinia'

const THEME_KEY = 'theme'

function getSavedTheme() {
  const saved = window.localStorage.getItem(THEME_KEY)
  return saved === 'dark' ? 'dark' : 'light'
}

function applyTheme(mode) {
  document.documentElement.classList.toggle('theme-dark', mode === 'dark')
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: getSavedTheme(),
  }),
  actions: {
    initialize() {
      this.mode = getSavedTheme()
      applyTheme(this.mode)
    },
    toggle() {
      this.mode = this.mode === 'dark' ? 'light' : 'dark'
      window.localStorage.setItem(THEME_KEY, this.mode)
      applyTheme(this.mode)
    },
  },
})

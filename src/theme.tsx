import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

const themeStorageKey = 'sanad-theme'
const readSharedTheme = (): Theme | null => {
  const value = document.cookie.split('; ').find(item => item.startsWith(`${themeStorageKey}=`))?.split('=')[1]
  return value === 'dark' || value === 'light' ? value : null
}
const writeSharedTheme = (theme: Theme) => {
  document.cookie = `${themeStorageKey}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`
}

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(themeStorageKey)
    return saved === 'dark' || saved === 'light' ? saved : readSharedTheme() ?? 'light'
  })
  const setTheme = (next: Theme) => { setThemeState(next); localStorage.setItem(themeStorageKey, next); writeSharedTheme(next) }

  useEffect(() => { document.documentElement.dataset.theme = theme; writeSharedTheme(theme) }, [theme])

  const value = useMemo(() => ({ theme, setTheme }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside ThemeProvider')
  return value
}

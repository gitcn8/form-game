import { create } from 'zustand'
import { GameState } from '../lib/types'

interface GameStore extends GameState {
  // Actions
  updatePlayer: (updates: Partial<GameStore['player']>) => void
  updateWorld: (updates: Partial<GameStore['world']>) => void
  updateFarm: (updates: Partial<GameStore['farm']>) => void
  updateInventory: (updates: Partial<GameStore['inventory']>) => void

  // Game actions
  addGold: (amount: number) => void
  useEnergy: (amount: number) => void
  nextDay: () => void

  // Reset
  resetGame: () => void
  loadGame: (state: GameState) => void
}

const initialPlayer = {
  id: '',
  name: '',
  gold: 500,
  energy: 100,
  maxEnergy: 100,
  level: 1,
  experience: 0
}

const initialInventory = {
  items: [
    { id: 'carrot_seed', name: '萝卜种子', type: 'seed', quantity: 5, sellPrice: 5 },
    { id: 'potato_seed', name: '土豆种子', type: 'seed', quantity: 3, sellPrice: 8 }
  ],
  capacity: 20
}

const initialFarm = {
  plots: Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    x: (i % 3) * 100,
    y: Math.floor(i / 3) * 100,
    crop: null,
    watered: false,
    state: 'empty' // empty, tilled, planted, watered, ready
  })),
  animals: []
}

const initialWorld = {
  day: 1,
  season: '春天' as const,
  time: 6,
  weather: '晴天' as const
}

const initialQuests = {
  active: [],
  completed: []
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  player: initialPlayer,
  inventory: initialInventory,
  farm: initialFarm,
  world: initialWorld,
  quests: initialQuests,
  relationships: {},
  unlocked: {
    crops: ['萝卜', '土豆'],
    animals: [],
    areas: ['农场']
  },

  // Update actions
  updatePlayer: (updates) =>
    set((state) => ({
      player: { ...state.player, ...updates }
    })),

  updateWorld: (updates) =>
    set((state) => ({
      world: { ...state.world, ...updates }
    })),

  updateFarm: (updates) =>
    set((state) => ({
      farm: { ...state.farm, ...updates }
    })),

  updateInventory: (updates) =>
    set((state) => ({
      inventory: { ...state.inventory, ...updates }
    })),

  // Game actions
  addGold: (amount) =>
    set((state) => ({
      player: { ...state.player, gold: state.player.gold + amount }
    })),

  useEnergy: (amount) =>
    set((state) => ({
      player: {
        ...state.player,
        energy: Math.max(0, state.player.energy - amount)
      }
    })),

  nextDay: () =>
    set((state) => {
      const newDay = state.world.day + 1
      const season = state.world.season
      const newSeason = newDay > 30 && season === '春天' ? '夏天' :
                       newDay > 60 && season === '夏天' ? '秋天' :
                       newDay > 90 && season === '秋天' ? '冬天' : season

      // 重置体力
      // 更新作物状态（这里暂时省略，后续实现）

      return {
        world: {
          ...state.world,
          day: newDay,
          season: newSeason,
          time: 6,
          weather: '晴天'
        },
        player: {
          ...state.player,
          energy: state.player.maxEnergy
        },
        farm: {
          ...state.farm,
          plots: state.farm.plots.map(plot => ({
            ...plot,
            watered: false // 新的一天，土地变干
          }))
        }
      }
    }),

  // Reset
  resetGame: () =>
    set({
      player: initialPlayer,
      inventory: initialInventory,
      farm: initialFarm,
      world: initialWorld,
      quests: initialQuests,
      relationships: {},
      unlocked: {
        crops: ['萝卜', '土豆'],
        animals: [],
        areas: ['农场']
      }
    }),

  loadGame: (state) =>
    set(state)
}))

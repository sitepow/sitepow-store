import { EventEmitter } from 'events'

declare global {
  var __chatEvents: EventEmitter | undefined
}

export const chatEvents = globalThis.__chatEvents ?? new EventEmitter()

if (!globalThis.__chatEvents) {
  chatEvents.setMaxListeners(0)
  globalThis.__chatEvents = chatEvents
}

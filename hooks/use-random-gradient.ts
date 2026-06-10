import { useState } from 'react'

const GRADIENTS = [
  'linear-gradient(135deg, #243949 0%, #517fa4 100%)',
  'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)',
  'linear-gradient(135deg, #021d44 0%, #07747e 100%)',
  'linear-gradient(135deg, #29323c 0%, #485563 100%)',
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #16222a 0%, #3a6073 100%)',
  'linear-gradient(135deg, #09203f 0%, #537895 100%)',
  'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
  'linear-gradient(135deg, #080f8a 0%, #000000 100%)',
  'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
]

let gradientPool: string[] = []

const shuffle = (array: string[]) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const getNextGradient = () => {
  if (gradientPool.length === 0) {
    gradientPool = shuffle(GRADIENTS)
  }
  return gradientPool.pop() || GRADIENTS[0]
}

export const useRandomGradient = () => {
  const [gradient] = useState(() => getNextGradient())

  return gradient
}

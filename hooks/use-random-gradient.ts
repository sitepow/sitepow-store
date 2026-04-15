import { useState } from 'react'

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
  'linear-gradient(135deg, #a6c0fe 0%, #f68084 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490d0 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1f5ff 100%)',
  'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
  'linear-gradient(135deg, #243949 0%, #517fa4 100%)',
  'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)',
  'linear-gradient(135deg, #021d44 0%, #07747e 100%)',
  'linear-gradient(135deg, #29323c 0%, #485563 100%)',
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #360033 0%, #0b8793 100%)',
  'linear-gradient(135deg, #16222a 0%, #3a6073 100%)',
  'linear-gradient(135deg, #09203f 0%, #537895 100%)',
  'linear-gradient(135deg, #1d2b64 0%, #f8cdca 100%)',
  'linear-gradient(135deg, #434343 0%, #000000 100%)',
  'linear-gradient(135deg, #ff9a8b 0%, #ff6a88 55%, #ff99ac 100%)',
  'linear-gradient(135deg, #fbed96 0%, #abecd6 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%)',
  'linear-gradient(135deg, #a1887f 0%, #f44336 100%)',
  'linear-gradient(135deg, #88d3ce 0%, #6e45e2 100%)',
  'linear-gradient(135deg, #d9afd9 0%, #97d9e1 100%)',
  'linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%)',
  'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
  'linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)',
  'linear-gradient(135deg, #D9a7c7 0%, #fffcdc 100%)',
  'linear-gradient(135deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)',
  'linear-gradient(135deg, #21D4FD 0%, #B721FF 100%)',
  'linear-gradient(135deg, #080f8a 0%, #000000 100%)',
  'linear-gradient(135deg, #3f0d12 0%, #a71d31 74%)',
  'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
  'linear-gradient(135deg, #e65c00 0%, #f9d423 100%)',
  'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
  'linear-gradient(135deg, #50cc7f 0%, #f5d100 100%)',
  'linear-gradient(135deg, #812632 0%, #eeaeca 100%)',
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

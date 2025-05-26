import React from 'react'
import { motion } from 'framer-motion'
import { Box, BoxProps } from '@chakra-ui/react'

interface FadeInProps extends BoxProps {
  children: React.ReactNode
  delay?: number
}

export function FadeIn({ children, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Box {...props}>{children}</Box>
    </motion.div>
  )
} 
import React, { ReactNode } from 'react'
import { Box, BoxProps } from '@chakra-ui/react'
import { motion, Variants } from 'framer-motion'

type CardProps = {
  children: ReactNode
  hover?: boolean
} & BoxProps

const MotionDiv = motion.div

export function Card({ children, hover = false, ...props }: CardProps) {
  const variants: Variants = {
    initial: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    hover: { y: -5, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  }

  return (
    <MotionDiv
      initial="initial"
      animate="initial"
      whileHover={hover ? "hover" : undefined}
      variants={variants}
      transition={{ duration: 0.2 }}
    >
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        p={6}
        {...props}
      >
        {children}
      </Box>
    </MotionDiv>
  )
} 
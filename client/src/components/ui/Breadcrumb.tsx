import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbNav({ items }: BreadcrumbProps) {
  const location = useLocation()

  return (
    <Breadcrumb
      spacing="8px"
      separator={<FiChevronRight color="gray.500" />}
      mb={6}
    >
      {items.map((item, index) => (
        <BreadcrumbItem key={index}>
          {item.path ? (
            <BreadcrumbLink
              as={RouterLink}
              to={item.path}
              color={location.pathname === item.path ? 'brand.500' : 'gray.500'}
            >
              {item.label}
            </BreadcrumbLink>
          ) : (
            <Text color="gray.500">{item.label}</Text>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  )
} 
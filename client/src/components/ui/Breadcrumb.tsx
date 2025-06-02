import { Box, Breadcrumb as ChakraBreadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

interface BreadcrumbProps {
  items: {
    label: string
    href?: string
  }[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <Box mb={4}>
      <ChakraBreadcrumb>
        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.href ? (
              <BreadcrumbLink as={Link} to={item.href}>
                {item.label}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbLink>{item.label}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </ChakraBreadcrumb>
    </Box>
  )
} 
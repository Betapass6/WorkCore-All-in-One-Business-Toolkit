import React from 'react'
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
} from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'

interface SearchFilterProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filterOptions?: { value: string; label: string }[]
  filterValue?: string
  onFilterChange?: (value: string) => void
}

export function SearchFilter({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filterOptions,
  filterValue,
  onFilterChange,
}: SearchFilterProps) {
  return (
    <HStack spacing={4}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <FiSearch color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </InputGroup>
      {filterOptions && onFilterChange && (
        <Select
          placeholder="Filter"
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          maxW="200px"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}
    </HStack>
  )
} 
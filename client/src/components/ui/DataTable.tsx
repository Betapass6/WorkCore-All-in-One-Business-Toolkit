import React from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'

interface Column<T> {
  header: string
  accessor: keyof T | ((item: T) => React.ReactNode)
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  error?: string
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  loading,
  error,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Spinner />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  if (data.length === 0) {
    return (
      <Box p={4}>
        <Text color="gray.500">{emptyMessage}</Text>
      </Box>
    )
  }

  return (
    <Box overflowX="auto">
      <Table>
        <Thead>
          <Tr>
            {columns.map((column, index) => (
              <Th key={index}>{column.header}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item, rowIndex) => (
            <Tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <Td key={colIndex}>
                  {typeof column.accessor === 'function'
                    ? column.accessor(item)
                    : String(item[column.accessor])}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
} 
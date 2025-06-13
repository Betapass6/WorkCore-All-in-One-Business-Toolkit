import { Grid as ChakraGrid, GridProps as ChakraGridProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export type GridProps = ChakraGridProps;

export const Grid = forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  return <ChakraGrid ref={ref} {...props} />;
});

Grid.displayName = 'Grid'; 
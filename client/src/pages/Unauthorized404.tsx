import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized404() {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, gray.400, gray.600)"
        backgroundClip="text">
        404
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        Page Not Found
      </Text>
      <Text color={'gray.500'} mb={6}>
        The page you are looking for does not exist or you do not have access.
      </Text>

      <Button
        colorScheme="gray"
        bgGradient="linear(to-r, gray.400, gray.500, gray.600)"
        color="white"
        variant="solid"
        onClick={() => navigate('/')}
      >
        Go to Home
      </Button>
    </Box>
  );
}

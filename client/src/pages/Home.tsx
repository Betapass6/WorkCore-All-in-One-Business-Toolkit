import { Box, Heading, Stack, Text, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Box>
      <Heading mb={4}>Welcome to WorkCore</Heading>
      <Text fontSize="lg" mb={6}>Your central hub for managing services, bookings, files, and feedback in one place.</Text>

      <Stack direction={{ base: "column", md: "row" }} spacing={4}>
        <Button as={Link} to="/dashboard" colorScheme="teal">Go to Dashboard</Button>
        <Button as={Link} to="/booking" variant="outline" colorScheme="teal">Book a Service</Button>
        <Button as={Link} to="/files" variant="outline" colorScheme="teal">Manage Files</Button>
        <Button as={Link} to="/feedback" variant="outline" colorScheme="teal">Give Feedback</Button>
      </Stack>
    </Box>
  );
};

export default Home;

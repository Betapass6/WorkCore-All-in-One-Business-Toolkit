import { Box, Heading, Stack, Text, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { user } = useAuth() || { user: null };
  const role = user ? user.role.toLowerCase() : "user";
  return (
    <Box>
      <Heading mb={4}>Welcome to WorkCore</Heading>
      <Text fontSize="lg" mb={6}>Your central hub for managing services, bookings, files, and feedback in one place.</Text>

      <Stack direction={{ base: "column", md: "row" }} spacing={4}>
        <Button as={Link} to={`/dashboard/${role}`} colorScheme="teal">Go to Dashboard</Button>
        <Button as={Link} to={`/bookings/${role}`} variant="outline" colorScheme="teal">Book a Service</Button>
        <Button as={Link} to={`/files/${role}`} variant="outline" colorScheme="teal">Manage Files</Button>
        <Button as={Link} to={`/feedback/${role}`} variant="outline" colorScheme="teal">Give Feedback</Button>
      </Stack>
    </Box>
  );
};

export default Home;

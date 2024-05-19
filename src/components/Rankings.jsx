import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  CSSReset,
  Image,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'
import { supabase } from "../supabase";

export default function Rankings() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    document.title = "VALORANT Stocks";

    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("networth", {ascending: false});

      if (error) {
        console.error("Error fetching profiles:", error.message);
        return;
      }
      setProfiles(data);
    };

    const channel = supabase
      .channel("profile-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchProfiles();
        }
      )
      .subscribe();

    fetchProfiles();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <CSSReset />
      <Box backgroundColor="black" pt={1} pb={1} h="100vh">
        <Box p="5" mx="auto" maxW="1200px" minW="800px" backgroundColor="grayAlpha.700" borderRadius="lg">
          <Flex justifyContent="center">
            <Heading color="white" m="2">Rankings</Heading>
          </Flex>
          <Box mx="auto" maxW="1150px" minW="850px">
            <Table color="white" fontSize="16" fontWeight={"bold"}>
              <TableCaption></TableCaption>
              <Thead>
                <Tr>
                  <Th color="grayAlpha.300">Rank</Th>
                  <Th color="grayAlpha.300">User</Th>
                  <Th color="grayAlpha.300">Net Worth</Th>
                </Tr>
              </Thead>
              <Tbody>
                {profiles.map((item, index) => {
                  return (
                    <Tr>
                      <Td>
                        <Flex alignItems="center">
                          <Text>{index+1}</Text>
                          <Image ml="5" src={"https://cdn3.emoji.gg/emojis/9768_Radiant_Valorant.png"} alt="Profile Picture" boxSize="40px"/>
                        </Flex>
                      </Td>
                      <Td>
                        <Flex alignItems="center">
                          <Image src={item.picture} alt="Profile Picture" boxSize="40px" borderRadius="full" mr="2"/>
                          <Text>{item.username}</Text>
                        </Flex>
                      </Td>
                      <Td>${item.networth}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>
    </>
  );
}
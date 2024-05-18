import { useEffect, useState } from "react";
import {
  Box,
  Flex,
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
        <Box mx="auto" maxW="1200px" minW="800px" backgroundColor="grayAlpha.700" borderRadius="lg">
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
                      <Td>{index+1}</Td>
                      <Td>
                        <Flex alignItems="center" m={1}>
                          <Image src={item.picture} alt="Profile Picture" boxSize="30px" borderRadius="full" mr="2"/>
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
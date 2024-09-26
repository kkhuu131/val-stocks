// BuyForm.js (React component)
import React, { useState } from "react";
import teamData from "../teamMappings.json";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Grid,
  FormControl,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Flex,
  Image,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import { supabase } from '../supabase';

const BuyForm = ({ symbol, stockPrice, userBalance}) => {
  const [amount, setAmount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { data: userResponse, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const user = userResponse.user;

      if(user) {
        const { error } = await supabase.rpc('buy_stock', {
          in_symbol: symbol,
          in_user_id: user.id,
          in_amount: amount
        });

        if (error) {
          console.error("Error buying stock:", error);
          return;
        }

        console.log("Stock purchased successfully.");
        setAmount(0);
      } else {
        console.error("User not authenticated");
      }
    } catch (error) {
      console.error("Error buying stock:", error)
    }

  };

  return (
    <Box alignItems="center" justifyContent="center" w="200px">
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent backgroundColor="grayAlpha.900" color="white" p="2">
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Buy {amount} {symbol} Stock
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                m={1}
                borderRadius="md"
                border="0px"
                backgroundColor="grayAlpha.500"
                color="white"
                fontSize="14"
                h="35px"
                w="70px"
                fontWeight={"bold"}
                _hover={{
                  backgroundColor:"grayAlpha.400"
                }}
              >
                Cancel
              </Button>
              <FormControl as="form" onSubmit={handleSubmit}>
                <Button
                  type="submit"
                  onClick={onClose}
                  m={1}
                  borderRadius="md"
                  border="0px"
                  backgroundColor="#0ea371"
                  color="white"
                  fontSize="14"
                  h="35px"
                  w="70px"
                  fontWeight={"bold"}
                  _hover={{
                    backgroundColor:"#11c286"
                  }}
                >
                  Buy
                </Button>
              </FormControl>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

        <NumberInput
          defaultValue={0}
          min={0}
          max={Math.round(userBalance/stockPrice * 1000) / 1000}
          onChange={(e) => setAmount(e)}
          precision={3}
          isRequired={true}
          step={1}
          backgroundColor="grayAlpha.700"
          color="white"
          borderRadius="lg"
          border="0px"
          m={1}
        >
          <NumberInputField
            fontSize="16"
            textAlign="center"
            border="0px"
            fontWeight="bold"
            height="40px"
            placeholder="Enter amount"
          />
          <NumberInputStepper>
            <NumberIncrementStepper children='+' color='grayAlpha.100' borderColor="grayAlpha.500" />
            <NumberDecrementStepper children='-' color='grayAlpha.100' borderColor="grayAlpha.500"/>
          </NumberInputStepper>
        </NumberInput>
        <Grid templateRows="auto"color="grayAlpha.50" m="2" fontSize="14">
            <Grid templateColumns="50% 50%">
              <Flex justifyContent="center">
                <Text>Total: </Text>
              </Flex>
              <Text>${(amount * stockPrice).toFixed(2)}</Text>
            </Grid>
        </Grid>
        <Flex alignItems="center" justifyContent="center">
          <Button
            onClick={onOpen}
            m={1}
            borderRadius="md"
            border="0px"
            backgroundColor="grayAlpha.500"
            color="white"
            fontSize="14"
            h="35px"
            w="60px"
            fontWeight={"bold"}
            _hover={{
              backgroundColor:"grayAlpha.400"
            }}
          >
            <Text>Buy</Text>
          </Button>
        </Flex>
    </Box>
  );
};

export default BuyForm;

import { useEffect, useState } from 'react';
import { HStack, Text, VStack, useTheme, ScrollView } from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';

import firestore from '@react-native-firebase/firestore';

import { Header } from '../components/Header';
import { OrderProps } from '../components/Order';
import { OrderFirestoreDTO } from '../DTOs/OrderFirestoreDTO';
import { dateFormat } from '../utils/firestoreDateFormat';
import { Loading } from '../components/Loading';
import { CircleWavyCheck, ClipboardText, DesktopTower, Hourglass } from 'phosphor-react-native';
import { CardDetails } from '../components/CardDetails';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from 'react-native';

type RouteParams = {
  orderId: string;
}

type OrderDetais = OrderProps & {
  description: string;
  solution: string;
  closed_at: string;
}

export function Details() {
  const [solution, setSolution] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetais>({} as OrderDetais);

  const route = useRoute();
  const { goBack } = useNavigation();
  const { orderId } = route.params as RouteParams;

  const { colors } = useTheme();

  function handleOrderClose() {
    if (!solution) {
      return Alert.alert('Solicitação', 'Informe solução para encerrar a solicitação.');
    }

    firestore()
      .collection<OrderFirestoreDTO>('orders')
      .doc(orderId)
      .update({
        status: 'closed',
        solution,
        closed_at: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        Alert.alert('Solicitação', 'Solicitação encerrada.')
        goBack();
      })
      .catch((error) => {
        console.log(error);
        Alert.alert('Solicitação', 'Não foi possível encerrar a solicitação.')
      })
  }

  useEffect(() => {
    firestore()
      .collection<OrderFirestoreDTO>('orders')
      .doc(orderId)
      .get()
      .then((doc) => {
        const {
          patrimony,
          description,
          status,
          created_at,
          closed_at,
          solution
        } = doc.data();

        const closed = closed_at ? dateFormat(closed_at) : null;

        setOrder({
          id: doc.id,
          patrimony,
          description,
          status,
          solution,
          when: dateFormat(created_at),
          closed_at: closed,
        })

        setIsLoading(false);
      })
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <VStack flex={1} bg="gray.700">
      <Header title='Solicitação' />

      <HStack bg="gray.500" justifyContent="center" p={4}>
        {
          order.status === 'closed'
            ? (
              <CircleWavyCheck color={colors.green[300]} size={22} />
            )
            :
            (
              <Hourglass color={colors.secondary[700]} size={22} />
            )
        }
        <Text
          fontSize="sm"
          color={order.status === 'closed' ? colors.green[300] : colors.secondary[700]}
          ml={2}
          textTransform="uppercase"
        >
          {order.status === 'closed' ? 'finalizado' : 'em andamento'}
        </Text>
      </HStack>

      <ScrollView mx={5} showsVerticalScrollIndicator={false}>
        <CardDetails
          title='equipamento'
          description={`Patrimônio ${order.patrimony}`}
          icon={DesktopTower}
        />

        <CardDetails
          title='descrição do problema'
          description={order.description}
          icon={ClipboardText}
          footer={`Registrado em ${order.when}`}
        />

        <CardDetails
          title='solução'
          description={order.solution}
          icon={CircleWavyCheck}
          footer={order.closed_at && `Encerrado em ${order.closed_at}`}
        >
          {
            order.status === 'open' &&
            <Input
              bg="gray.600"
              placeholder="Descrição da solução"
              onChangeText={setSolution}
              h={24}
              textAlignVertical="top"
              multiline
            />
          }
        </CardDetails>
      </ScrollView>
      {
        order.status === 'open' &&
        <Button
          title="Encerrar solicitação"
          m={5}
          onPress={handleOrderClose}
        />
      }
    </VStack>
  );
} 7
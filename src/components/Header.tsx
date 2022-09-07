import { useNavigation } from '@react-navigation/native';
import { Heading, HStack, IconButton, StyledProps, useTheme } from 'native-base';
import { CaretLeft } from 'phosphor-react-native';

type Props = StyledProps & {
  title: string;
}

export function Header({ title }: Props) {
  const { goBack } = useNavigation();
  const { colors } = useTheme();

  function handleGoBack() {
    goBack();
  }

  return (
    <HStack
      w="full"
      justifyContent="space-between"
      alignItems="center"
      bg="gray.600"
      pb={6}
      pt={12}
    >
      <IconButton
        icon={
          <CaretLeft color={colors.gray[200]} size={24} />
        }
        onPress={handleGoBack}
        ml={2}
      />

      <Heading
        color="gray.100"
        textAlign="center"
        fontSize="lg"
        flex={1}
        pr={12}
      >
        {title}
      </Heading>

    </HStack>
  );
}
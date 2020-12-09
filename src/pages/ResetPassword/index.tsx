import React, { useRef, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import * as Yup from 'yup';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import {
  Container, Content, Background, AnimationContainer,
} from './styles';
import logoImg from '../../assets/logo.svg';
import Input from '../../components/Input';
import Button from '../../components/Button';
import getValidationErrors from '../../ultils/getValidationErrors';
import { useToast } from '../../hooks/toast';
import api from '../../services/api';

interface ResetPasswordDTO {
  password: string;
  password_confirmation: string;
}

const ResetPassword: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const location = useLocation();
  const { addToast } = useToast();
  const history = useHistory();

  const handleSubmit = useCallback(async (data: ResetPasswordDTO) => {
    try {
      formRef.current?.setErrors({});
      const schema = Yup.object().shape({
        password: Yup.string().required('A senha e obrigatória'),
        password_confirmation: Yup.string().oneOf(
          [Yup.ref('password'), undefined],
          'Confirmação incorreta',
        ),
      });

      await schema.validate(data, {
        abortEarly: false,
      });

      const { password, password_confirmation } = data;
      const token = location.search.replace('?token=', '');

      if (!token) {
        throw new Error();
      }

      await api.post('/password/reset', {
        password, password_confirmation, token,
      });

      history.push('/');
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors = getValidationErrors(error);
        formRef.current?.setErrors(errors);

        return;
      }

      addToast({
        type: 'error',
        title: 'Opss..',
        description: 'Ocorreu um erro ao resetar sua senha.',
      });
    }
  }, [addToast, history, location]);

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />
          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Resetar senha</h1>
            <Input icon={FiLock} name="password" type="password" placeholder="Nova Senha" />
            <Input icon={FiLock} name="password_confirmation" type="password" placeholder="Confirmar Senha" />
            <Button type="submit">Alterar senha</Button>
          </Form>
        </AnimationContainer>
      </Content>
      <Background />
    </Container>
  );
};

export default ResetPassword;

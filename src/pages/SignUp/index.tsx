import React from 'react';
import {
  FiArrowLeft, FiMail, FiUser, FiLock,
} from 'react-icons/fi';
import { Container, Content, Background } from './styles';
import logoImg from '../../assets/logo.svg';
import Input from '../../components/Input';
import Button from '../../components/Button';

const SignUp: React.FC = () => (
  <Container>
    <Background />
    <Content>
      <img src={logoImg} alt="GoBarber" />
      <form>
        <h1>Faça seu Cadastro</h1>

        <Input icon={FiUser} name="user" placeholder="Name" />
        <Input icon={FiMail} name="email" placeholder="E-mail" />
        <Input icon={FiLock} name="password" type="password" placeholder="senha" />
        <Button type="submit">Cadastrar</Button>
      </form>

      <a href="back">
        <FiArrowLeft />
        Voltar
      </a>
    </Content>
  </Container>
);

export default SignUp;

import React, { ChangeEvent, useCallback, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  FiMail, FiUser, FiLock, FiCamera, FiArrowLeft,
} from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import {
  Container, Content, AvatarInput,
} from './styles';
import Input from '../../components/Input';
import Button from '../../components/Button';
import getValidationErrors from '../../ultils/getValidationErrors';
import api from '../../services/api';
import { useToast } from '../../hooks/toast';
import { useAuth } from '../../hooks/auth';

interface ProfileFormData {
  name: string,
  email: string,
  old_password: string,
  password: string,
  password_confirmation: string,
}

const Profile: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const history = useHistory();
  const { user, updateUser } = useAuth();

  const handleSubmit = useCallback(async (data: ProfileFormData) => {
    try {
      formRef.current?.setErrors({});
      const schema = Yup.object().shape({
        name: Yup.string().required('Nome Obrigatório'),
        email: Yup.string().required('Email Obrigatório').email('Formato de Email inválido'),
        old_password: Yup.string(),
        password: Yup.string().when('old_password', {
          is: (val) => !!val.length,
          then: Yup.string().required('Campo Obrigatório'),
          otherwise: Yup.string(),
        }),
        password_confirmation: Yup.string()
          .when('old_password', {
            is: (val) => !!val.length,
            then: Yup.string().required('Campo Obrigatório'),
            otherwise: Yup.string(),
          })
          .oneOf(
            [Yup.ref('password'), undefined],
            'Confirmação incorreta',
          ),
      });

      await schema.validate(data, {
        abortEarly: false,
      });

      const {
        name, email, password, old_password, password_confirmation,
      } = data;

      const formData = {
        name,
        email,
        ...(old_password ? {
          password, old_password, password_confirmation,
        } : {}),
      };

      const response = await api.put('/profile', formData);

      updateUser(response.data);

      history.push('/dashboard');

      addToast({
        type: 'success',
        title: 'Sucesso!',
        description: 'Perfil atualizado com sucesso.',
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors = getValidationErrors(error);
        formRef.current?.setErrors(errors);

        return;
      }

      addToast({
        type: 'error',
        title: 'Opss..',
        description: 'Erro ao atualizar, tente novamente!',
      });
    }
  }, [addToast, history]);

  const handleAvatarChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const data = new FormData();
    data.append('avatar', e.target.files[0]);

    api.patch('/users/avatar', data).then((response) => {
      updateUser(response.data);
      addToast({
        type: 'success',
        title: 'Avatar atualizado com sucesso.',
      });
    });
  }, [addToast, updateUser]);

  return (
    <Container>
      <header>
        <div>
          <Link to="dashboard">
            <FiArrowLeft />
          </Link>
        </div>
      </header>
      <Content>
        <Form ref={formRef} onSubmit={handleSubmit} initialData={{ name: user.name, email: user.email }}>
          <AvatarInput>
            <img src={user.avatar_url} alt={user.name} />

            <label htmlFor="avatar">
              <FiCamera />
              <input type="file" id="avatar" onChange={handleAvatarChange} />
            </label>
          </AvatarInput>
          <h1>Meu Perfil</h1>
          <Input icon={FiUser} name="name" placeholder="Name" />
          <Input icon={FiMail} name="email" placeholder="E-mail" />

          <Input containerStyle={{ marginTop: 24 }} icon={FiLock} name="old_password" type="password" placeholder="Senha atual" />
          <Input icon={FiLock} name="password" type="password" placeholder="Nova senha" />
          <Input icon={FiLock} name="password_confirmation" type="password" placeholder="Confirmar senha" />

          <Button type="submit">Confirmar mudanças</Button>
        </Form>
      </Content>
    </Container>
  );
};

export default Profile;

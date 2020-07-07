import React from 'react';
import { FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { Container, Toast } from './styles';

const ToastContainer: React.FC = () => (
  <Container>
    <Toast hasDescription>
      <FiAlertCircle size={20} />
      <div>
        <strong>Aconteceu um erro</strong>
        <p>Cruzeiro esta na série A</p>
      </div>
      <button type="button">
        <FiXCircle size={18} />
      </button>
    </Toast>
  </Container>
);

export default ToastContainer;

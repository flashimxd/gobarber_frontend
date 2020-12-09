import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { isToday, format, isAfter } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import DayPicker, { DayModifiers } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import { FiClock, FiPower } from 'react-icons/fi';
import { parseISO } from 'date-fns/esm';
import {
  Container,
  Header,
  HeaderContent,
  Profile,
  Schedule,
  Content,
  Calendar,
  NextAppointments,
  Section,
  Appointment,
} from './styles';

import logoImg from '../../assets/logo.svg';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

interface MonthAvailabilityItem {
  day: number,
  available: boolean,
}

interface Appointment {
  id: string;
  date: string;
  hourFormatted: string;
  User: {
    name: string;
    avatar_url: string
  }
}

const DashBoard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthAvailability, setMonthAvailability] = useState<MonthAvailabilityItem[]>([]);
  const { signOut, user } = useAuth();
  const { name, avatar_url, id } = user;

  const handleDateChange = useCallback((day: Date, modifiers: DayModifiers) => {
    if (modifiers.available && !modifiers.disabled) {
      setSelectedDate(day);
    }
  }, []);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  const disabledDays = useMemo(() => {
    const dates = monthAvailability
      .filter(({ available }) => available === false)
      .map(({ day }) => {
        const year = currentMonth.getUTCFullYear();
        const month = currentMonth.getMonth();

        return new Date(year, month, day);
      });

    return dates;
  }, [currentMonth, monthAvailability]);

  const selectedDateAsText = useMemo(() => format(selectedDate, "'Dia' dd 'de' MMMM", {
    locale: ptBR,
  }), [selectedDate]);

  const selectedWeekDay = useMemo(() => format(selectedDate, 'cccc', { locale: ptBR }), [selectedDate]);

  const morningAppointments = useMemo(() => appointments.filter((appointment) => parseISO(appointment.date).getHours() < 12), [appointments]);

  const afternoonAppointments = useMemo(() => appointments.filter((appointment) => parseISO(appointment.date).getHours() >= 12), [appointments]);

  const nextAppointment = useMemo(() => appointments.find((appointment) => isAfter(parseISO(appointment.date), new Date())), [appointments]);

  useEffect(() => {
    api.get(`/providers/${id}/month-availability`, {
      params: {
        year: currentMonth.getFullYear(),
        month: currentMonth.getMonth() + 1,
      },
    }).then((response) => {
      setMonthAvailability(response.data);
    });
  }, [currentMonth, id]);

  useEffect(() => {
    api.get<Appointment[]>('appointments/me', {
      params: {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1,
        day: selectedDate.getDate(),
      },
    }).then((response) => {
      const appointmentsFormatted = response.data.map((appointment) => ({
        ...appointment,
        hourFormatted: format(parseISO(appointment.date), 'HH:mm'),
      }));
      setAppointments(appointmentsFormatted);
    });
  }, [selectedDate]);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <img src={logoImg} alt="GoBarber" />
          <Profile>
            <img src={avatar_url} alt={name} />
            <div>
              <span>Bem-vindo,</span>
              <strong>{name}</strong>
            </div>
          </Profile>
          <button type="button" onClick={signOut}>
            <FiPower />
          </button>
        </HeaderContent>
      </Header>
      <Content>
        <Schedule>
          <h1>Horários agendados</h1>
          <p>
            {isToday(selectedDate) && <span>Hoje</span>}
            <span>{selectedDateAsText}</span>
            <span>{selectedWeekDay}</span>
          </p>

          { isToday(selectedDate) && nextAppointment && (
            <NextAppointments>
              <strong>Agendamento a seguir</strong>
              <div>
                <img src={nextAppointment.User.avatar_url} alt={nextAppointment.User.name} />
                <strong>{nextAppointment.User.name}</strong>
                <span>
                  <FiClock />
                  {nextAppointment.hourFormatted}
                </span>
              </div>
            </NextAppointments>
          )}

          <Section>
            <strong>Manhã</strong>

            {morningAppointments.length === 0 && (
              <p>Nenhum agendamento neste período.</p>
            )}

            {morningAppointments.map((appointment) => (
              <Appointment key={appointment.id}>
                <span>
                  <FiClock />
                  {appointment.hourFormatted}
                </span>
                <div>
                  <img src={appointment.User.avatar_url} alt={appointment.User.name} />
                  <strong>{appointment.User.name}</strong>
                </div>
              </Appointment>
            ))}

          </Section>

          <Section>
            <strong>Tarde</strong>

            {afternoonAppointments.length === 0 && (
              <p>Nenhum agendamento neste período.</p>
            )}

            {afternoonAppointments.map((appointment) => (
              <Appointment key={appointment.id}>
                <span>
                  <FiClock />
                  {appointment.hourFormatted}
                </span>
                <div>
                  <img src={appointment.User.avatar_url} alt={appointment.User.name} />
                  <strong>{appointment.User.name}</strong>
                </div>
              </Appointment>
            ))}
          </Section>

        </Schedule>
        <Calendar>
          <DayPicker
            selectedDays={selectedDate}
            onDayClick={handleDateChange}
            onMonthChange={handleMonthChange}
            fromMonth={new Date()}
            disabledDays={[{ daysOfWeek: [0, 6] }, ...disabledDays]}
            modifiers={{
              available: { daysOfWeek: [1, 2, 3, 4, 5] },
            }}
            weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            months={[
              'Janeiro',
              'Fevereiro',
              'Março',
              'Abril',
              'Maio',
              'Junho',
              'Julho',
              'Agosto',
              'Setembro',
              'Outubro',
              'Novembro',
              'Dezembro',
            ]}
          />
        </Calendar>
      </Content>
    </Container>
  );
};

export default DashBoard;

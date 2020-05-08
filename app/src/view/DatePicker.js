/**
 * Date picker, wraps ReactDatePicker for now
 * @author scjody
 * @since May 2020
 * @flow
 */

import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { formatISO, parseISO } from 'date-fns';

type FormTarget = { target: { name: string, value: string }};
type P = {
  name: string,
  onChange: FormTarget => void,
  selected: string,
};

const DatePicker = ({name, onChange, selected}: P) => {
  const onChangeWrapper = (value) => {
    const event = {"target": {"name": name, "value": formatISO(value)}};
    onChange(event);
  }
  return (
    <ReactDatePicker
      key={name}
      showTimeSelect
      timeFormat="h:mm aa"
      timeIntervals={15}
      timeCaption="time"
      dateFormat="MMMM d, yyyy h:mm aa"
      onChange={onChangeWrapper}
      selected={selected ? parseISO(selected) : null}
    />
  )};

export default DatePicker;

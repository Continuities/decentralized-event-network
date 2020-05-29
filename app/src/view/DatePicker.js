/**
 * Date picker, wraps ReactDatePicker for now
 * @author scjody
 * @since May 2020
 * @flow
 */

import React from 'react';
import { createPortal } from 'react-dom';
import ReactDatePicker from 'react-datepicker';
import { makeStyles } from '@material-ui/core/styles';
import { formatISO, parseISO } from 'date-fns';

import 'react-datepicker/dist/react-datepicker.css';

type FormTarget = { target: { name: string, value: string }};
type P = {
  name: string,
  onChange: FormTarget => void,
  selected: string,
  label: string,
};

const useStyles = makeStyles((theme) => {
  const borderColor = theme.palette.type === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)';

  return {
    label: {
      position: 'relative',
      display: 'inline-block',
      paddingTop: '6px',
      marginTop: '16px',
      marginBottom: '8px',
      width: '100%',
      '& .react-datepicker-wrapper': {
        display: 'inline',
      },
    },
    datepicker: {
      backgroundColor: theme.palette.background.paper,
      borderColor: borderColor,
      borderTopColor: 'transparent',
      border: 'solid 1px',
      borderRadius: theme.shape.borderRadius,
      padding: '18.5px 14px',
      color: theme.palette.text.primary,
      fontSize: theme.typography.fontSize,
      lineHeight: '18px',
      width: '100%',
      '&:hover': {
        borderColor: theme.palette.text.primary,
        borderTopColor: 'transparent',
      },
    },
    span: {
      position: 'absolute',
      top: '0',
      left: '0',
      display: 'flex',
      width: '100%',
      fontSize: '10px',
      lineHeight: '15px',
      '&:before,&:after': {
        content: '""',
        display: 'block',
        boxSizing: 'border-box',
        marginTop: '6px',
        borderTop: 'solid 1px',
        borderColor: borderColor,
        minWidth: '10px',
        height: '8px',
      },
      '&:hover::before,&:hover::after': {
        borderColor: theme.palette.text.primary,
      },
      '&:before': {
        marginRight: '4px',
        borderLeft: 'solid 1px transparent',
        borderRadius: '4px 0',
      },
      '&:after': {
        flexGrow: '1',
        marginLeft: '4px',
        borderRight: 'solid 1px transparent',
        borderRadius: '0 4px 4px 0',
        height: '57px',
      },
    },
    '@global': {
      '#datepickers .react-datepicker__header, #datepickers .react-datepicker__current-month, #datepickers .react-datepicker__day-name, #datepickers .react-datepicker-time__header': {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderColor: borderColor,
      },
      '#datepickers .react-datepicker, #datepickers .react-datepicker__day, #datepickers .react-datepicker__time, #datepickers .react-datepicker__time-container': {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderColor: borderColor,
      },
      '#datepickers .react-datepicker__time-list-item': {
        height: 'auto',
        padding: '7px 10px',
      },
      '#datepickers .react-datepicker__day--selected, #datepickers .react-datepicker__time-list-item--selected': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      },
      '#datepickers .react-datepicker__day:hover, #datepickers .react-datepicker__time-list-item:hover': {
        backgroundColor: theme.palette.background.default,
      },
    },
  };
});

const Portal = ({children}) => {
  const portalRoot = document.getElementById("portal");
  const el = document.createElement("div");
  el.id = "datepickers";

  if (!portalRoot) {
    console.error("No portal root found");
    return;
  }

  React.useEffect(() => {
    portalRoot.appendChild(el);
    return () => { portalRoot.removeChild(el); };
  }, [el, portalRoot]);

  return createPortal(children, el);
};

const DatePicker = ({name, onChange, selected, label}: P) => {
  const onChangeWrapper = (value) => {
    const event = {"target": {"name": name, "value": formatISO(value)}};
    onChange(event);
  }
  const styles = useStyles();
  return (
    <label className={styles.label}>
      <ReactDatePicker
        key={name}
        className={styles.datepicker}
        popperContainer={Portal}
        minDate={new Date()}
        showTimeSelect
        timeFormat="h:mm aa"
        timeIntervals={15}
        timeCaption="time"
        dateFormat="MMMM d, yyyy h:mm aa"
        onChange={onChangeWrapper}
        selected={selected ? parseISO(selected) : null}
      />
      <span className={styles.span}>{label}</span>
    </label>
  )};

export default DatePicker;

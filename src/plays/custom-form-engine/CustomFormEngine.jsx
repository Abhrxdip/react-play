import PlayHeader from 'common/playlists/PlayHeader';
import { useMemo, useRef, useState } from 'react';
import './styles.css';

const FORM_SCHEMA = [
  {
    id: 'fullName',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Ada Lovelace',
    validators: [
      { type: 'required', message: 'Name is required.' },
      { type: 'minLength', value: 3, message: 'Name must be at least 3 characters.' }
    ]
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'ada@example.com',
    validators: [
      { type: 'required', message: 'Email is required.' },
      { type: 'email', message: 'Enter a valid email address.' }
    ]
  },
  {
    id: 'age',
    label: 'Age',
    type: 'number',
    placeholder: '25',
    validators: [
      { type: 'required', message: 'Age is required.' },
      { type: 'numberRange', min: 18, max: 120, message: 'Age must be between 18 and 120.' }
    ]
  },
  {
    id: 'country',
    label: 'Country',
    type: 'select',
    options: ['', 'India', 'United States', 'Germany', 'Japan'],
    validators: [{ type: 'required', message: 'Please select a country.' }]
  },
  {
    id: 'subscribe',
    label: 'Subscribe to updates',
    type: 'checkbox',
    validators: []
  }
];

const createInitialValues = (schema) => {
  const result = {};
  schema.forEach((field) => {
    if (field.type === 'checkbox') {
      result[field.id] = false;
      return;
    }
    result[field.id] = '';
  });
  return result;
};

const validators = {
  required: (value, field) => {
    if (field.type === 'checkbox') {
      return value === true;
    }
    return String(value || '').trim().length > 0;
  },
  minLength: (value, rule) => String(value || '').trim().length >= rule.value,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim()),
  numberRange: (value, rule) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return false;
    return parsed >= rule.min && parsed <= rule.max;
  }
};

function CustomFormEngine(props) {
  const [schema, setSchema] = useState(FORM_SCHEMA);
  const [values, setValues] = useState(() => createInitialValues(FORM_SCHEMA));
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const inputRefs = useRef({});

  const requiredCount = useMemo(() => {
    return schema.filter((field) => field.validators.some((rule) => rule.type === 'required')).length;
  }, [schema]);

  const getFieldError = (field, value, allValues) => {
    const rules = field.validators || [];
    for (let i = 0; i < rules.length; i += 1) {
      const rule = rules[i];
      if (rule.type === 'required') {
        const ok = validators.required(value, field, allValues);
        if (!ok) return rule.message;
        continue;
      }
      const validator = validators[rule.type];
      if (!validator) continue;
      if (!validator(value, rule, allValues)) {
        return rule.message;
      }
    }
    return '';
  };

  const validateField = (fieldId, allValues) => {
    const field = schema.find((item) => item.id === fieldId);
    if (!field) return '';
    return getFieldError(field, allValues[fieldId], allValues);
  };

  const validateForm = (allValues) => {
    const nextErrors = {};
    schema.forEach((field) => {
      const message = getFieldError(field, allValues[field.id], allValues);
      if (message) {
        nextErrors[field.id] = message;
      }
    });
    return nextErrors;
  };

  const handleChange = (field, event) => {
    const nextValue = field.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((prev) => {
      const nextValues = { ...prev, [field.id]: nextValue };
      const message = validateField(field.id, nextValues);
      setErrors((prevErrors) => ({ ...prevErrors, [field.id]: message }));
      return nextValues;
    });
  };

  const addDynamicField = () => {
    const fieldId = `skill_${schema.length + 1}`;
    const newField = {
      id: fieldId,
      label: `Skill ${schema.length - 3}`,
      type: 'text',
      placeholder: 'React, TypeScript, Testing...',
      validators: [
        { type: 'required', message: 'Skill is required.' },
        { type: 'minLength', value: 2, message: 'Skill should be at least 2 characters.' }
      ]
    };

    setSchema((prev) => [...prev, newField]);
    setValues((prev) => ({ ...prev, [fieldId]: '' }));
    setErrors((prev) => ({ ...prev, [fieldId]: '' }));
  };

  const focusFirstInvalid = (nextErrors) => {
    const firstInvalid = schema.find((field) => nextErrors[field.id]);
    if (!firstInvalid) return;
    const element = inputRefs.current[firstInvalid.id];
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors);
      return;
    }
    setSubmittedData(values);
  };

  const renderField = (field) => {
    if (field.type === 'select') {
      return (
        <select
          id={field.id}
          name={field.id}
          ref={(el) => {
            inputRefs.current[field.id] = el;
          }}
          value={values[field.id]}
          onChange={(event) => handleChange(field, event)}
        >
          {field.options.map((option) => (
            <option key={`${field.id}-${option || 'default'}`} value={option}>
              {option || 'Select an option'}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <input
          id={field.id}
          name={field.id}
          ref={(el) => {
            inputRefs.current[field.id] = el;
          }}
          type="checkbox"
          checked={values[field.id]}
          onChange={(event) => handleChange(field, event)}
        />
      );
    }

    return (
      <input
        id={field.id}
        name={field.id}
        ref={(el) => {
          inputRefs.current[field.id] = el;
        }}
        type={field.type}
        placeholder={field.placeholder || ''}
        value={values[field.id]}
        onChange={(event) => handleChange(field, event)}
      />
    );
  };

  return (
    <div className="play-details">
      <PlayHeader play={props} />
      <div className="play-details-body">
        <section className="custom-form-engine">
          <div className="custom-form-engine__intro">
            <h2>Custom Form Engine</h2>
            <p>
              Schema-driven, dynamic fields, and a validation engine with focus management using
              refs.
            </p>
            <button type="button" className="add-field-btn" onClick={addDynamicField}>
              Add Dynamic Skill Field
            </button>
          </div>

          <form className="custom-form-engine__form" onSubmit={handleSubmit} noValidate>
            {schema.map((field) => {
              const error = errors[field.id];
              return (
                <div key={field.id} className="form-row">
                  <label htmlFor={field.id}>
                    {field.label}
                    {field.validators.some((rule) => rule.type === 'required') ? ' *' : ''}
                  </label>
                  {renderField(field)}
                  {error ? <span className="error-text">{error}</span> : null}
                </div>
              );
            })}

            <button type="submit" className="submit-btn">
              Validate and Submit
            </button>
          </form>

          <div className="custom-form-engine__meta">
            <p>
              <strong>Required fields:</strong> {requiredCount}
            </p>
            <p>
              <strong>Total fields:</strong> {schema.length}
            </p>
          </div>

          {submittedData ? (
            <div className="custom-form-engine__result">
              <h3>Submitted Data</h3>
              <pre>{JSON.stringify(submittedData, null, 2)}</pre>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default CustomFormEngine;

# custom-form-engine

A hard-level play that builds a schema-based custom form engine from scratch.

## Play Demographic

- Language: JavaScript
- Level: Hard

## What You Will Learn

- How to build a dynamic form from a schema config.
- How to create a custom validation engine without form libraries.
- How to use `useRef` for focus management on invalid fields.
- How to add fields dynamically at runtime while preserving validation behavior.

## Features

- Schema-driven rendering (`text`, `email`, `number`, `select`, `checkbox`)
- Validation rules (`required`, `minLength`, `email`, `numberRange`)
- Real-time field validation and on-submit full validation
- Focus first invalid input with refs
- Dynamic field addition (`Skill` fields)

## Implementation Details

The main logic is in `CustomFormEngine.jsx` and is split into:

- `FORM_SCHEMA`: Declarative field definitions.
- `validators`: Small rule functions that form a validation engine.
- `validateField` and `validateForm`: Rule executor helpers.
- `inputRefs`: Ref registry keyed by field id for error focus handling.

## Resources

- React docs on refs: https://react.dev/reference/react/useRef
- React docs on forms: https://react.dev/learn/sharing-state-between-components

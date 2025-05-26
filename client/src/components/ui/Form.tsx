import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  FormControlProps,
} from '@chakra-ui/react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface FormFieldProps extends FormControlProps {
  label: string
  name: string
  type?: string
  register: UseFormRegister<any>
  errors: FieldErrors
  options?: { value: string; label: string }[]
}

export function FormField({
  label,
  name,
  type = 'text',
  register,
  errors,
  options,
  ...props
}: FormFieldProps) {
  return (
    <FormControl isInvalid={!!errors[name]} {...props}>
      <FormLabel>{label}</FormLabel>
      {type === 'select' && options ? (
        <Select {...register(name)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : type === 'number' ? (
        <NumberInput>
          <NumberInputField {...register(name)} />
        </NumberInput>
      ) : (
        <Input type={type} {...register(name)} />
      )}
      <FormErrorMessage>
        {errors[name]?.message as string}
      </FormErrorMessage>
    </FormControl>
  )
} 
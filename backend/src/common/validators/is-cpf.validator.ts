import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { validateCPF } from './cpf-validators';

export function IsCPF(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isCPF',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') return false;
                    return validateCPF(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return 'CPF inválido';
                }
            },
        });
    };
}

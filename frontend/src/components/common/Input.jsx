import { forwardRef } from 'react';
import { cn } from '@/utils/helpers';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LeftIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 border rounded-lg transition-all outline-none',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'placeholder:text-gray-400',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300',
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10',
              props.disabled && 'bg-gray-50 cursor-not-allowed',
              className
            )}
            {...props}
          />

          {RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <RightIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

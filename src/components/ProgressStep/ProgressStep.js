import React from 'react';
import classNames from 'classnames';
import css from './ProgressStep.module.css';
import IconArrowHead from '../IconArrowHead/IconArrowHead';

/**
 * ProgressStep Component
 *
 * A reusable progress step wrapper that handles navigation between steps.
 * Pass your form content as children.
 *
 * @param {Object} props
 * @param {string} props.className - The class name for the root element.
 * @param {string} props.rootClassName - The class name for the root element.
 * @param {number} props.currentStep - The current step.
 * @param {Array<string>} props.steps - The steps.
 * @param {Function} props.onStepChange - The function to call when the step changes.
 * @param {JSX.Element} props.children - The children of the component.
 * @param {Object} props.rest - The rest of the props.
 * @returns {JSX.Element} - The ProgressStep component.
 * @example
 * <ProgressStep currentStep={2} stepTitles={['Step 1', 'Step 2', 'Step 3']}>
 *   <YourFormComponent />
 * </ProgressStep>
 */
const ProgressStep = props => {
  const {
    className,
    rootClassName,
    currentStep = 1,
    steps = [],
    onStepChange,
    children,
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes} {...rest}>
      <div className={css.container}>
        {/* Header */}
        <div className={css.header}>
          {/* Progress Navigation */}
          <div className={css.progressNav}>
            {steps.map((step, index) => (
              <div
                key={index}
                className={css.progressItem}
                onClick={() => !step.disabled && onStepChange(index + 1)}
              >
                <span
                  className={classNames(css.progressText, {
                    [css.disabled]: step.disabled,
                    [css.active]: index === currentStep - 1 && !step.disabled,
                    [css.completed]: index < currentStep - 1,
                  })}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <IconArrowHead
                    className={classNames(css.arrowIcon, {
                      [css.disabled]: currentStep <= index,
                    })}
                    direction="right"
                    size="small"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className={css.content}>{children}</div>
      </div>
    </div>
  );
};

export default ProgressStep;

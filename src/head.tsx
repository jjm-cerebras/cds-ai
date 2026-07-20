import { Badge } from '@cerebras/common'
import clsx from 'clsx'
import { ReactNode } from 'react'

export const Header = ({
  heading,
  smallSubHeading, // For a short subheading right under heading
  smallSubHeadingBadgeText,
  subHeading, // For a longer subheading appearing a gap below heading
  renderActions,
  headingActions,
  className,
  headingClassName,
  headingBottomMargin = 'mb-6'
}: {
  heading: string
  smallSubHeading?: string
  smallSubHeadingBadgeText?: string
  subHeading?: string | ReactNode
  renderActions?: () => ReactNode
  headingActions?: ReactNode
  className?: string
  headingClassName?: string
  headingBottomMargin?: string
}) => {
  return (
    <>
      <div
        className={clsx(
          'flex items-center justify-between',
          className,
          headingBottomMargin
        )}
      >
        <div className="flex min-w-0 flex-col">
          <div
            className={clsx(
              'text-neutral-95 flex items-center gap-2 text-xl',
              headingClassName
            )}
          >
            {heading}
            {headingActions}
          </div>
          {smallSubHeading && (
            <div
              className={clsx(
                'text-neutral-60 mt-1 flex min-w-0 items-center gap-2 text-lg',
                smallSubHeading.includes(' / ') ? 'max-w-md' : 'max-w-xs'
              )}
            >
              <span className="truncate">{smallSubHeading}</span>
              {smallSubHeadingBadgeText && (
                // eslint-disable-next-line jsx-a11y/aria-role
                <Badge small role="green" text={smallSubHeadingBadgeText} />
              )}
            </div>
          )}
        </div>
        {renderActions?.()}
      </div>
      {subHeading && (
        <div className="text-md-loose text-neutral-95">{subHeading}</div>
      )}
    </>
  )
}
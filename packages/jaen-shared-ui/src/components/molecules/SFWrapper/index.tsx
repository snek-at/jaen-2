import {
  Box,
  Button,
  ButtonGroup,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  useDisclosure,
  VStack,
  Wrap,
  WrapProps
} from '@chakra-ui/react'
import {FaCube} from '@react-icons/all-files/fa/FaCube'
import React from 'react'

export interface SFWrapperProps extends WrapProps {
  ref: React.Ref<HTMLDivElement>
  displayName: string
  blockTypes: {name: string; onClick: () => void}[]
  isEditing: boolean
  wrap?: boolean
}

const SFWrapper: React.FC<SFWrapperProps> = ({
  children,
  ref,
  displayName,
  blockTypes,
  isEditing,
  wrap = false,
  ...wrapProps
}) => {
  const popover = useDisclosure()

  const shouldRenderSkeleton = React.useMemo(
    () => !React.Children.toArray(children).length,
    [children]
  )

  const Wrapper = wrap ? Wrap : Box

  const content = isEditing ? (
    <Wrapper
      {...wrapProps}
      ref={ref}
      boxShadow={popover.isOpen ? 'outline' : 'none'}
      rounded="md">
      {shouldRenderSkeleton ? <Skeleton h={20} /> : children}
    </Wrapper>
  ) : (
    <Wrapper {...wrapProps}>{children}</Wrapper>
  )

  return (
    <Box>
      <Popover
        trigger="hover"
        placement="auto"
        isOpen={popover.isOpen}
        onOpen={popover.onOpen}
        onClose={popover.onClose}>
        <PopoverTrigger>{content}</PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />

          <PopoverHeader>{displayName}</PopoverHeader>
          <PopoverBody>
            <VStack align="stretch">
              {blockTypes.map(({name, onClick}, index) => (
                <Button
                  key={index}
                  leftIcon={<FaCube />}
                  colorScheme="teal"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClick()
                  }}>
                  {name}
                </Button>
              ))}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  )
}

export default SFWrapper
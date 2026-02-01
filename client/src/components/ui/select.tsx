"use client"

import { Select as ChakraSelect, Portal } from "@chakra-ui/react"
import * as React from "react"

interface SelectContentProps extends ChakraSelect.ContentProps {
    portalled?: boolean
    portalRef?: React.RefObject<HTMLElement>
}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
    function SelectContent(props, ref) {
        const { portalled = true, portalRef, ...rest } = props
        return (
            <Portal disabled={!portalled} container={portalRef}>
                <ChakraSelect.Positioner>
                    <ChakraSelect.Content ref={ref} {...rest} />
                </ChakraSelect.Positioner>
            </Portal>
        )
    },
)

export const SelectItem = React.forwardRef<
    HTMLDivElement,
    ChakraSelect.ItemProps
>(function SelectItem(props, ref) {
    const { item, children, ...rest } = props
    return (
        <ChakraSelect.Item key={item.value} item={item} ref={ref} {...rest}>
            {children}
            <ChakraSelect.ItemIndicator />
        </ChakraSelect.Item>
    )
})

export const SelectValueText = React.forwardRef<
    HTMLSpanElement,
    ChakraSelect.ValueTextProps & {
        children?: (items: any[]) => React.ReactNode
    }
>(function SelectValueText(props, ref) {
    const { children, ...rest } = props
    return (
        <ChakraSelect.ValueText ref={ref} {...rest}>
            <ChakraSelect.Context>
                {(select) => {
                    const items = select.selectedItems
                    if (items.length === 0) return rest.placeholder
                    if (children) return children(items)
                    if (items.length === 1)
                        return select.collection.stringifyItem(items[0])
                    return `${items.length} selected`
                }}
            </ChakraSelect.Context>
        </ChakraSelect.ValueText>
    )
})

export const SelectRoot = ChakraSelect.Root
export const SelectLabel = ChakraSelect.Label
export const SelectTrigger = ChakraSelect.Trigger
export const SelectIndicator = ChakraSelect.Indicator
export const SelectClearTrigger = ChakraSelect.ClearTrigger
export const SelectControl = ChakraSelect.Control
export const SelectItemText = ChakraSelect.ItemText
export const SelectItemGroup = ChakraSelect.ItemGroup
export const SelectItemGroupLabel = ChakraSelect.ItemGroupLabel
export const SelectHiddenSelect = ChakraSelect.HiddenSelect

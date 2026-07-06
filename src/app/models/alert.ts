import { AlertTypeEnum } from '@enums'

export interface Alert {
    id: string
    type: AlertTypeEnum
    message: string
    subtext: string[]
    timeout?: ReturnType<typeof setTimeout>
}

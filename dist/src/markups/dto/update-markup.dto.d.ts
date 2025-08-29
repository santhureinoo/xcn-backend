import { CreateMarkupDto } from './create-markup.dto';
declare const UpdateMarkupDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateMarkupDto>>;
export declare class UpdateMarkupDto extends UpdateMarkupDto_base {
    updatedBy?: string;
}
export {};

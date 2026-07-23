import { Transform } from 'class-transformer';
import { IsBooleanString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ImageLibraryQueryDto {
  @Transform(({ value }) => Number(value)) @IsOptional() @IsInt() @Min(1) @Max(100000) page?: number;
  @Transform(({ value }) => Number(value)) @IsOptional() @IsInt() @Min(1) @Max(96) pageSize?: number;
  @IsOptional() @IsString() keyword?: string;
  @IsOptional() @IsString() groupName?: string;
  @IsOptional() @IsBooleanString() hasAlpha?: string;
  @IsOptional() @IsBooleanString() used?: string;
  @IsOptional() @IsIn(['created_at', 'updated_at', 'file_size']) sort?: string;
}

export class RenameImageLibraryAssetDto { @IsString() displayName!: string; }
export class CreateImageVariantDto {
  @IsOptional() @IsString() variantId?: string;
  @IsOptional() @IsString() name?: string;
  @Transform(({ value }) => Number(value)) @IsOptional() @IsInt() @Min(1) @Max(8192) width?: number;
  @Transform(({ value }) => Number(value)) @IsOptional() @IsInt() @Min(1) @Max(8192) height?: number;
  @IsOptional() @IsIn(['contain', 'cover']) fit?: string;
  @IsOptional() @IsIn(['png', 'jpeg']) format?: string;
  @IsOptional() @IsBooleanString() transparent?: string;
  @IsOptional() @IsString() background?: string;
  @IsOptional() @IsIn(['centre', 'north', 'south', 'east', 'west']) position?: string;
}
export class BatchImageVariantDto extends CreateImageVariantDto {
  @IsString({ each: true }) assetIds!: string[];
}

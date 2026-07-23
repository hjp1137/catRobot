import { ImageLibraryService } from '../src/modules/image-library/image-library.service';

describe('ImageLibraryService batch variants', () => {
  it('keeps successful items when a batch contains a failed item', async () => {
    const service = new ImageLibraryService({} as never);
    jest.spyOn(service, 'createVariant')
      .mockResolvedValueOnce({ duplicate: false, variant: { id: 'variant_ok' } })
      .mockRejectedValueOnce(new Error('source missing'));

    await expect(service.createVariants(['asset_ok', 'asset_missing'], {
      width: 256, height: 256, fit: 'contain', format: 'png', transparent: true,
    }, 'editor_1')).resolves.toEqual({
      succeeded: 1,
      failed: 1,
      results: [
        expect.objectContaining({ assetId: 'asset_ok', ok: true }),
        expect.objectContaining({ assetId: 'asset_missing', ok: false, error: 'source missing' }),
      ],
    });
  });
});

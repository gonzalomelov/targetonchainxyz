'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { components } from 'react-select';
import Select from 'react-select/async';
import type { z } from 'zod';

import { getBaseUrl } from '@/utils/Helpers';
import type { FrameDefaultValues } from '@/validations/FrameValidation';
import {
  FrameValidation,
  MatchingCriteriaEnumSchema,
} from '@/validations/FrameValidation';

type IFrameFormProps =
  | {
      edit: true;
      id: number;
      defaultValues: z.infer<typeof FrameDefaultValues>;
      onValid: SubmitHandler<z.infer<typeof FrameValidation>>;
    }
  | {
      edit?: false;
      defaultValues?: z.infer<typeof FrameDefaultValues>;
      onValid: SubmitHandler<z.infer<typeof FrameValidation>>;
    };

type OptionType = {
  label: string;
  value: string;
  image: string;
};

const CustomSingleValue = (props: any) => {
  return (
    <components.SingleValue {...props}>
      {props.data.maxReferralFee > 0 && (
        <div className="flex items-center justify-between">
          <span>{props.data.label}</span>
          {props.data.maxReferralFee && (
            <span className="rounded bg-gray-100 px-2 py-1">
              {props.data.maxReferralFee}%
            </span>
          )}
        </div>
      )}
      {props.data.maxReferralFee === 0 && (
        <div>
          <span>{props.data.label}</span>
        </div>
      )}
    </components.SingleValue>
  );
};

const CustomGroupHeading = (props: any) => {
  const title =
    props.children === 'Your Stores' ? 'Your Stores' : 'Other Stores';
  return (
    <components.GroupHeading {...props}>
      <div className="flex justify-between">
        <span>{title}</span>
        <span>Max Earnings per Sale</span>
      </div>
    </components.GroupHeading>
  );
};

const CustomOption = (props: any) => {
  return (
    <components.Option {...props}>
      {props.data.maxReferralFee > 0 && (
        <div className="flex items-center justify-between">
          <span>{props.data.label}</span>
          <span className="rounded bg-gray-100 px-2 py-1">
            {props.data.maxReferralFee}%
          </span>
        </div>
      )}
      {props.data.maxReferralFee === 0 && (
        <div>
          <span>{props.data.label}</span>
        </div>
      )}
    </components.Option>
  );
};

const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const fetchCreatorShops = async (creator: string) => {
  const response = await fetch(`/api/slice/stores?creator=${creator}`, {
    method: 'GET',
  });

  return response.json();
};

const fetchAllShops = async (inputValue: string) => {
  const response = await fetch(`/api/slice/stores?search=${inputValue}`, {
    method: 'GET',
  });

  return response.json();
};

const FrameForm = (props: IFrameFormProps) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof FrameValidation>>({
    resolver: zodResolver(FrameValidation),
    mode: 'onChange',
    defaultValues:
      props.edit || props.defaultValues ? props.defaultValues : undefined,
  });
  const router = useRouter();
  const t = useTranslations('FrameForm');
  const [creatorShopOptions, setCreatorShopOptions] = useState<OptionType[]>(
    [],
  );
  const [otherShopOptions, setOtherShopOptions] = useState<OptionType[]>([]);
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [imageURL, setImageURL] = useState('/assets/images/placeholder.png');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isAdditionalSettingsCollapsed, setIsAdditionalSettingsCollapsed] =
    useState(true);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const creator = watch('creator');
  const selectedShop = watch('shop');
  const buttonText = watch('button');

  const loadOptions = async (
    inputValue: string,
    callback: (options: any[]) => void,
  ) => {
    const stores = await fetchAllShops(inputValue);
    const options = stores.map(
      (store: {
        id: string;
        name: string;
        image: string;
        maxReferralFee: string;
      }) => ({
        value: `https://slice.so/slicer/${store.id}`,
        label: store.name,
        image: store.image,
        maxReferralFee: store.maxReferralFee,
      }),
    );
    callback(options);
  };

  const debouncedLoadOptions = debounce(loadOptions, 500);

  useEffect(() => {
    const fetchInitialStores = async () => {
      const creatorStores = creator ? await fetchCreatorShops(creator) : [];
      const allStores = await fetchAllShops('');

      const creatorOptions = creatorStores.map(
        (store: {
          id: string;
          name: string;
          image: string;
          maxReferralFee: string;
        }) => ({
          value: `https://slice.so/slicer/${store.id}`,
          label: store.name,
          image: store.image,
          maxReferralFee: store.maxReferralFee,
        }),
      );

      const otherOptions = allStores.map(
        (store: {
          id: string;
          name: string;
          image: string;
          maxReferralFee: string;
        }) => ({
          value: `https://slice.so/slicer/${store.id}`,
          label: store.name,
          image: store.image,
          maxReferralFee: store.maxReferralFee,
        }),
      );

      setCreatorShopOptions(creatorOptions);
      setOtherShopOptions(otherOptions);

      const initialSelection =
        creatorOptions.length > 0 ? creatorOptions[0] : otherOptions[0];
      if (initialSelection) {
        setValue('shop', initialSelection.value, { shouldValidate: true });
        setValue('title', initialSelection.label, { shouldValidate: true });
        setValue(
          'image',
          `${getBaseUrl()}/api/og?layoutType=fullWidth&title=${encodeURIComponent(initialSelection.label)}&subtitle=${encodeURIComponent('Click below for exclusive recommendations!')}&content=&url=${initialSelection.image}&width=600`,
          { shouldValidate: true },
        );
        setImageURL(
          `${getBaseUrl()}/api/og?layoutType=fullWidth&title=${encodeURIComponent(initialSelection.label)}&subtitle=${encodeURIComponent('Click below for exclusive recommendations!')}&content=&url=${initialSelection.image}&width=600`,
        );
        setSelectedOption(initialSelection);
      }
    };

    fetchInitialStores();
  }, [creator, setValue]);

  useEffect(() => {
    if (selectedShop) {
      const selected =
        creatorShopOptions.find((shop) => shop.value === selectedShop) ||
        otherShopOptions.find((shop) => shop.value === selectedShop);
      if (selected) {
        setValue('title', selected.label, { shouldValidate: true });
        setValue(
          'image',
          `${getBaseUrl()}/api/og?layoutType=fullWidth&title=${encodeURIComponent(selected.label)}&subtitle=${encodeURIComponent('Click below for exclusive recommendations!')}&content=&url=${selected.image}&width=600`,
          { shouldValidate: true },
        );
        setImageURL(
          `${getBaseUrl()}/api/og?layoutType=fullWidth&title=${encodeURIComponent(selected.label)}&subtitle=${encodeURIComponent('Click below for exclusive recommendations!')}&content=&url=${selected.image}&width=600`,
        );
      }
    }
  }, [selectedShop, setValue, creatorShopOptions, otherShopOptions]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'image' && value.image) {
        setIsImageLoading(true);
        setImageURL(value.image);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleCreate = handleSubmit(
    async ({ title, shop, image, button, matchingCriteria }) => {
      setIsSubmitDisabled(true); // Disable the button
      setIsLoading(true); // Show loading indicator
      try {
        await props.onValid({ title, shop, image, button, matchingCriteria });

        reset();
        router.refresh();
      } catch (error) {
        setIsSubmitDisabled(false); // Re-enable the button if an error occurs
        setIsLoading(false); // Hide loading indicator
      }
    },
  );

  return (
    <form onSubmit={handleCreate} className="mx-4">
      <div className="mt-3" style={{ display: 'none' }}>
        <label
          className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]"
          htmlFor="creator"
        >
          {t('creator')}
          <input
            type="hidden"
            id="creator"
            placeholder="Wallet address of the Slice store creator"
            className="mt-2 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-900 focus:outline-none focus:ring focus:ring-blue-300/50"
            {...register('creator')}
          />
        </label>
        {errors.creator?.message && (
          <div className="my-2 text-xs italic text-red-500">
            {errors.creator?.message}
          </div>
        )}
      </div>

      <div className="mt-3">
        <label
          className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]"
          htmlFor={`shop${props.edit ? `-${props.id}` : ''}`}
        >
          {t('shop')}
          <Select
            id={`shop${props.edit ? `-${props.id}` : ''}`}
            placeholder="Select a shop"
            defaultOptions={[
              { label: 'Your Stores', options: creatorShopOptions },
              { label: 'Other Stores', options: otherShopOptions },
            ]}
            value={selectedOption}
            loadOptions={debouncedLoadOptions}
            onChange={(selectedOptionValue: any) => {
              if (
                selectedOptionValue &&
                'value' in selectedOptionValue &&
                selectedOptionValue.value !== selectedOption?.value
              ) {
                setValue('shop', selectedOptionValue.value, {
                  shouldValidate: true,
                });
                setValue('title', selectedOptionValue.label, {
                  shouldValidate: true,
                });
                setValue('image', selectedOptionValue.image, {
                  shouldValidate: true,
                });
                setSelectedOption(selectedOptionValue);
              }
            }}
            className="mt-2 text-base"
            components={{
              Option: CustomOption,
              GroupHeading: CustomGroupHeading,
              SingleValue: CustomSingleValue,
            }}
            styles={{
              control: (base) => ({
                ...base,
                color: '#1A202C', // text-gray-900
              }),
              singleValue: (base) => ({
                ...base,
                color: '#1A202C', // text-gray-900
              }),
              input: (base) => ({
                ...base,
                color: '#1A202C', // text-gray-900
              }),
              option: (provided) => ({
                ...provided,
                color: '#1A202C', // text-gray-900
              }),
              placeholder: (base) => ({
                ...base,
                color: '#A0AEC0', // text-gray-400
              }),
              menu: (base) => ({
                ...base,
                color: '#1A202C', // text-gray-900
              }),
            }}
          />
        </label>
        {errors.shop?.message && (
          <div className="my-2 text-xs italic text-red-500">
            {errors.shop?.message}
          </div>
        )}
      </div>

      <div className="mt-3" style={{ display: 'none' }}>
        <label
          className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]"
          htmlFor={`title${props.edit ? `-${props.id}` : ''}`}
        >
          {t('title')}
          <input
            type="hidden"
            id={`title${props.edit ? `-${props.id}` : ''}`}
            placeholder="Name of the Slice store"
            className="mt-2 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-900 focus:outline-none focus:ring focus:ring-blue-300/50"
            {...register('title')}
          />
        </label>
        {errors.title?.message && (
          <div className="my-2 text-xs italic text-red-500">
            {errors.title?.message}
          </div>
        )}
      </div>

      <div className="mt-3" style={{ display: 'none' }}>
        <label
          className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]"
          htmlFor={`matchingCriteria${props.edit ? `-${props.id}` : ''}`}
        >
          {t('matchingCriteria')}
          <select
            id={`matchingCriteria${props.edit ? `-${props.id}` : ''}`}
            className="mt-2 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-900 focus:outline-none focus:ring focus:ring-blue-300/50"
            {...register('matchingCriteria')}
          >
            {MatchingCriteriaEnumSchema.options.map((matchingCriteria) => (
              <option key={matchingCriteria} value={matchingCriteria}>
                {matchingCriteria}
              </option>
            ))}
          </select>
        </label>
        {errors.matchingCriteria?.message && (
          <div className="my-2 text-xs italic text-red-500">
            {errors.matchingCriteria?.message}
          </div>
        )}
      </div>

      {imageURL && (
        <div className="mt-3">
          <label
            className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]"
            htmlFor={`frame${props.edit ? `-${props.id}` : ''}`}
          >
            Frame
            <div className="relative mx-5 mt-3">
              <div className="relative rounded-t-lg border border-[#4c3a4e] border-opacity-10">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-8 animate-spin rounded-full border-y-2 border-gray-900" />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageURL}
                  alt="Selected"
                  className="h-auto w-full rounded-t-lg"
                  onLoad={() => setIsImageLoading(false)}
                />
              </div>
              {/* eslint-disable-next-line tailwindcss/migration-from-tailwind-2 */}
              <div className="space-y-2 rounded-lg rounded-t-none bg-gray-100 px-4 py-2 dark:bg-[#2A2432]">
                <div className="grid w-full grid-cols-1 grid-rows-1 items-center gap-[10px]">
                  <div className="flex h-8 flex-row items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-xs font-semibold dark:bg-[#ffffff1a]">
                    <span className="line-clamp-1 items-center text-xs font-normal text-gray-400">
                      {buttonText}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </label>
        </div>
      )}

      <div className="mt-5">
        <button
          type="button"
          onClick={() =>
            setIsAdditionalSettingsCollapsed(!isAdditionalSettingsCollapsed)
          }
          className="flex w-full cursor-pointer items-center text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]"
          aria-expanded={!isAdditionalSettingsCollapsed}
        >
          Customize frame
          <span className="ml-1">
            {isAdditionalSettingsCollapsed ? '+' : '-'}
          </span>
        </button>
      </div>

      {!isAdditionalSettingsCollapsed && (
        <div className="mt-3">
          <div className="mt-3">
            <label
              className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]"
              htmlFor={`image${props.edit ? `-${props.id}` : ''}`}
            >
              {t('image')}
              <select
                id={`image${props.edit ? `-${props.id}` : ''}`}
                className="mt-2 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-900 focus:outline-none focus:ring focus:ring-blue-300/50"
                {...register('image')}
              >
                <option
                  value={`${getBaseUrl()}/api/og?layoutType=fullWidth&title=${encodeURIComponent(selectedOption!.label)}&subtitle=${encodeURIComponent('Click below for exclusive recommendations!')}&content=&url=${selectedOption?.image}&width=600`}
                >
                  Full Width Image
                </option>
                <option
                  value={`${getBaseUrl()}/api/og?title=${encodeURIComponent(selectedOption!.label)}&subtitle=${encodeURIComponent('Click below for exclusive recommendations!')}&content=&url=${selectedOption?.image}&width=600`}
                >
                  Left Image
                </option>
                {/* <option
                  value={`${getBaseUrl()}/api/gif?text=Click below for exclusive recommendations!&title=${encodeURIComponent(selectedOption!.label)}&subtitle=&content=&url=${selectedOption?.image}&width=600`}
                >
                  GIF Image
                </option> */}
              </select>
            </label>
            {errors.image?.message && (
              <div className="my-2 text-xs italic text-red-500">
                {errors.image?.message}
              </div>
            )}
          </div>

          <div className="mt-3">
            <label
              className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]"
              htmlFor={`button${props.edit ? `-${props.id}` : ''}`}
            >
              {t('button')}
              <select
                id={`button${props.edit ? `-${props.id}` : ''}`}
                className="mt-2 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-900 focus:outline-none focus:ring focus:ring-blue-300/50"
                {...register('button')}
              >
                <option value="Show">Show</option>
                <option value="Present">Present</option>
                <option value="Unveil">Unveil</option>
                <option value="Recommend">Recommend</option>
                <option value="Suggest">Suggest</option>
              </select>
            </label>
            {errors.button?.message && (
              <div className="my-2 text-xs italic text-red-500">
                {errors.button?.message}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-5">
        <button
          type="submit"
          disabled={!isValid || isSubmitDisabled}
          className={`w-full rounded px-4 py-2 transition duration-300 ${
            isValid && !isSubmitDisabled
              ? 'bg-violet-400'
              : 'cursor-not-allowed bg-gray-400'
          }`}
        >
          <span className="font-bold text-white">
            {isLoading ? 'Creating...' : t('create')}
          </span>
        </button>
      </div>
    </form>
  );
};

export { FrameForm };

import { JSX, SVGProps } from 'react';
import {
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
  UsersIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  ArrowLeftOnRectangleIcon,
  UserPlusIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

export type IconType = (props: SVGProps<SVGSVGElement>) => JSX.Element;

export const Icons = {
  dashboard: (props: SVGProps<SVGSVGElement>) => <Squares2X2Icon {...props} />,
  user: (props: SVGProps<SVGSVGElement>) => <UserIcon {...props} />,
  settings: (props: SVGProps<SVGSVGElement>) => <Cog6ToothIcon {...props} />,
  users: (props: SVGProps<SVGSVGElement>) => <UsersIcon {...props} />,
  home: (props: SVGProps<SVGSVGElement>) => <HomeIcon {...props} />,
  info: (props: SVGProps<SVGSVGElement>) => <InformationCircleIcon {...props} />,
  currency: (props: SVGProps<SVGSVGElement>) => <CurrencyDollarIcon {...props} />,
  login: (props: SVGProps<SVGSVGElement>) => <ArrowLeftOnRectangleIcon {...props} />,
  userPlus: (props: SVGProps<SVGSVGElement>) => <UserPlusIcon {...props} />,
};

export type IconName = keyof typeof Icons;
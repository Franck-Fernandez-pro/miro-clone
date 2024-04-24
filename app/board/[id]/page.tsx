import { Room } from "@/components/room";
import { Canvas } from "./_components/canvas";
import { Loading } from "./_components/loading";

interface BoardIdPageProps {
  params: {
    id: string;
  };
}

const BoardIdPage = ({ params: { id } }: BoardIdPageProps) => {
  return (
    <Room roomId={id} fallback={<Loading />}>
      <Canvas boardId={id} />
    </Room>
  );
};

export default BoardIdPage;

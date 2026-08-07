import WatermarkedViewer from '../components/WatermarkedViewer';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { validateShareAccess } from '../lib/firebase';

export default function VerificationPage() {
  const { shareId } = useParams();
  const [shareData, setShareData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShare() {
      if (!shareId) {
        setLoading(false);
        return;
      }

      try {
        const result = await validateShareAccess({
          share_token: shareId,
          user_agent: navigator.userAgent,
        });

        if (result.valid && result.share) {
          const share: any = {
            ...result.share,
            share_results: (result.test_results || []).map((tr: any) => ({ test_results: tr })),
          };
          setShareData({ share, member: result.member });
        }
      } catch (error) {
        console.error('Failed to load share:', error);
      }

      setLoading(false);
    }

    loadShare();
  }, [shareId]);

  if (loading) return <div>Loading...</div>;
  if (!shareData) return <div>Share not found</div>;

  return (
    <WatermarkedViewer
      data={shareData}
      onReset={() => window.location.reload()}
    />
  );
}

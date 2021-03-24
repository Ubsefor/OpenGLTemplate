#version 410
in vec2 fragUV;
out vec4 FragColor;

uniform mat4 ProjViewInv;
uniform vec3 CameraPos;


#define FAR_INF 1e9
#define EPS 1e-4
#define RAY_DEPTH 7
#define STACK_SIZE 130
struct Ray
{
    vec3 pos, dir;
    float transparent;
    int depth;
};
struct Sphere
{
    vec3 pos;
    float radius;
};
struct Collision
{
    bool hit;
    vec3 pos, normal;
    float dist;
};
struct SphereMaterial
{
  vec3 color;
};

const int SphereN = 1;
Sphere spheres[SphereN] = Sphere[SphereN](
  Sphere(vec3(0,0,0), 1));
SphereMaterial spheresMat[SphereN] = SphereMaterial[SphereN](
  SphereMaterial(vec3(0.1,0.1,0.3)));


void raycast_sphere(inout Collision collision, in Sphere sphere, in Ray ray)
{
  vec3 center = ray.pos - sphere.pos;
  float c = dot(center, center) - sphere.radius*sphere.radius;
  float b = dot(center, ray.dir);
  float a = dot(ray.dir, ray.dir);
  float D = b * b - a * c;
  if (D < 0)
  {
    collision.hit = false;
    return;
  }
  D = sqrt(D);
  float t = 0;
  float t1 = (-D - b) / a;
  if (t1 >= 0)
    t = t1;
  else
  {
    float t2 = (D - b) / a;
    if (t2 >= 0)
      t = t2;
    else
    {
      collision.hit = false;
      return;
    }
  }
  collision.hit = true;
  collision.dist = t;
  collision.pos = ray.pos + ray.dir * t;
  collision.normal = normalize(collision.pos - sphere.pos);
}

Ray get_ray(vec2 uv)
{
    Ray ray;
    vec4 pos = ProjViewInv * vec4(fragUV, 0, 1.0);
    ray.dir = normalize(pos.xyz / pos.w - CameraPos);
    ray.pos = CameraPos;
    ray.transparent = 0;
    ray.depth = 0;
    return ray;
}
float simple_noise(vec3 pos)
{
  float noise = sin(pos.x * 10.1) + cos(pos.y * 20.2) + sin(13*pos.z);
  return abs(noise) / 3;
}
bool find_collision_spheres(in Ray ray, out Collision bestCollision, inout int sphereInd)
{
  bestCollision.hit = false;
  bestCollision.dist = FAR_INF;
  for (int i = 0; i < SphereN; i++)
  {
    Collision collision;
    raycast_sphere(collision, spheres[i], ray);
    if (collision.hit && collision.dist < bestCollision.dist)
    {
      bestCollision = collision;
      sphereInd = i;
    }
  }
  return bestCollision.hit;
}
void main()
{
  vec4 color;
    Ray ray = get_ray(fragUV);
    Collision bestCollision;
    int sphereInd = -1;
    
  if (find_collision_spheres(ray, bestCollision, sphereInd))
  {
    color.rgb = bestCollision.normal;
  }
  else
  {
    color.rgb = ray.dir;
  }
  FragColor = vec4(color.rgb , 1.0);
}

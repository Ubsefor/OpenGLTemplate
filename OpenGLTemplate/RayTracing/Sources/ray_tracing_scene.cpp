#include "ray_tracing_scene.h"
#include "../../Camera/cameras.h"
#include "../../Application/application.h"
#include "../../Screenshoot/screenshoot.h"
RayTracingScene::RayTracingScene(Shader shader):PostFX(shader)
{

}
void RayTracingScene::postfx_render() 
{
  CameraPtr camera = main_camera();
  if (!camera)
    return;
  const Camera& mainCam = *camera;
  mat4 camTransform = mainCam.get_transform_matrix();
  mat4 ProjViewInv =  camTransform * inverse(mainCam.get_projection());
  shader.set_mat4x4("ProjViewInv", ProjViewInv);
  vec3 camPos = camTransform[3];
  shader.set_vec3("CameraPos", camPos);
}
void RayTracingScene::postfx_unbind()
{
  //unbind all resources here
}
void RayTracingScene::save()
{
  take_screenshoot("../../screen_shoot.png");
}

void init_scene(vector<GameObjectPtr>&gameObjects)
{

  Input &input = Application::get_input();
  {
    shared_ptr<ArcballCamera> arcballCam;
  
    GameObjectPtr camera = make_game_object();
    arcballCam = camera->add_component<ArcballCamera>(vec3(0), 10, vec2(0.f, 30.f*DegToRad));
    arcballCam->set_perspective(90.f * DegToRad, 0.01f, 5000.f);
    add_camera(arcballCam);
    input.mouse_move_event() += createMethodEventHandler(*arcballCam, &ArcballCamera::mouse_move_handler);
    input.mouse_click_event() += createMethodEventHandler(*arcballCam, &ArcballCamera::mouse_click_handler);
    input.mouse_wheel_event() += createMethodEventHandler(*arcballCam, &ArcballCamera::mouse_wheel_handler);
    gameObjects.push_back(camera);
  }
  {
    GameObjectPtr postfx = make_game_object();
    postfx->add_component<RayTracingScene>(get_shader("ray_tracing_scene"));
    gameObjects.push_back(postfx);
  }


}
